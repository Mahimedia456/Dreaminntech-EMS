import { query } from "../../config/db.js";

const FINANCE_ALLOWED_EMAILS = [
  "umairawan@mahimediasolutions.com",
  "shahid@mahimediasolutions.com",
];

function isFinanceUser(req) {
  return FINANCE_ALLOWED_EMAILS.includes(String(req.user?.email || "").toLowerCase());
}

function isUmair(req) {
  return String(req.user?.email || "").toLowerCase() === "umairawan@mahimediasolutions.com";
}

function isShahid(req) {
  return String(req.user?.email || "").toLowerCase() === "shahid@mahimediasolutions.com";
}

async function logExpenseActivity(expenseId, userId, action, description) {
  await query(
    `
    INSERT INTO finance_expense_activity_logs
    (expense_id, user_id, action, description)
    VALUES ($1,$2,$3,$4)
    `,
    [expenseId, userId, action, description]
  );
}

function buildExpenseNo() {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `EXP-${ym}-${Date.now().toString().slice(-6)}`;
}

export async function getFinanceCategories(req, res) {
  try {
    if (!isFinanceUser(req)) return res.status(403).json({ message: "Forbidden" });

    const result = await query(
      `
      SELECT *
      FROM finance_expense_categories
      WHERE status='active'
      ORDER BY name ASC
      `
    );

    return res.json({ categories: result.rows });
  } catch (error) {
    console.error("Finance categories error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getFinanceExpenses(req, res) {
  try {
    if (!isFinanceUser(req)) return res.status(403).json({ message: "Forbidden" });

    const { month, year, status, categoryId, q } = req.query;

    const params = [];
    const filters = [];

    if (month && month !== "all") {
      params.push(Number(month));
      filters.push(`EXTRACT(MONTH FROM fe.expense_date) = $${params.length}`);
    }

    if (year && year !== "all") {
      params.push(Number(year));
      filters.push(`EXTRACT(YEAR FROM fe.expense_date) = $${params.length}`);
    }

    if (status && status !== "all") {
      params.push(status);
      filters.push(`fe.status = $${params.length}`);
    }

    if (categoryId && categoryId !== "all") {
      params.push(categoryId);
      filters.push(`fe.category_id = $${params.length}`);
    }

    if (q) {
      params.push(`%${q}%`);
      filters.push(`
        (
          fe.expense_no ILIKE $${params.length}
          OR fe.title ILIKE $${params.length}
          OR fe.vendor ILIKE $${params.length}
          OR fe.invoice_number ILIKE $${params.length}
          OR fe.bill_number ILIKE $${params.length}
        )
      `);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await query(
      `
      SELECT
        fe.*,
        fec.name AS category_name,
        creator.full_name AS created_by_name,
        creator.email AS created_by_email,
        reviewer.full_name AS reviewed_by_name,
        approver.full_name AS approved_by_name,
        COUNT(fef.id)::int AS files_count
      FROM finance_expenses fe
      LEFT JOIN finance_expense_categories fec ON fec.id = fe.category_id
      LEFT JOIN app_users creator ON creator.id = fe.created_by
      LEFT JOIN app_users reviewer ON reviewer.id = fe.reviewed_by
      LEFT JOIN app_users approver ON approver.id = fe.approved_by
      LEFT JOIN finance_expense_files fef ON fef.expense_id = fe.id
      ${where}
      GROUP BY fe.id, fec.name, creator.full_name, creator.email, reviewer.full_name, approver.full_name
      ORDER BY fe.expense_date DESC, fe.created_at DESC
      LIMIT 500
      `,
      params
    );

    const summary = await query(
      `
      SELECT
        COUNT(*)::int AS total_records,
        COALESCE(SUM(fe.total),0) AS total_amount,
        COALESCE(SUM(fe.amount),0) AS subtotal_amount,
        COALESCE(SUM(fe.tax),0) AS total_tax,
        COALESCE(SUM(fe.discount),0) AS total_discount,
        COUNT(*) FILTER (WHERE fe.status='submitted')::int AS submitted,
        COUNT(*) FILTER (WHERE fe.status='under_review')::int AS under_review,
        COUNT(*) FILTER (WHERE fe.status='approved')::int AS approved,
        COUNT(*) FILTER (WHERE fe.status='rejected')::int AS rejected,
        COUNT(*) FILTER (WHERE fe.status='paid')::int AS paid
      FROM finance_expenses fe
      ${where}
      `,
      params
    );

    return res.json({
      expenses: result.rows,
      summary: summary.rows[0] || {},
    });
  } catch (error) {
    console.error("Finance expenses error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function getFinanceExpenseDetail(req, res) {
  try {
    if (!isFinanceUser(req)) return res.status(403).json({ message: "Forbidden" });

    const expense = await query(
      `
      SELECT
        fe.*,
        fec.name AS category_name,
        creator.full_name AS created_by_name,
        creator.email AS created_by_email,
        reviewer.full_name AS reviewed_by_name,
        approver.full_name AS approved_by_name
      FROM finance_expenses fe
      LEFT JOIN finance_expense_categories fec ON fec.id = fe.category_id
      LEFT JOIN app_users creator ON creator.id = fe.created_by
      LEFT JOIN app_users reviewer ON reviewer.id = fe.reviewed_by
      LEFT JOIN app_users approver ON approver.id = fe.approved_by
      WHERE fe.id=$1
      LIMIT 1
      `,
      [req.params.id]
    );

    if (!expense.rows.length) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const [files, feedback, activity] = await Promise.all([
      query(
        `
        SELECT f.*, u.full_name AS uploaded_by_name
        FROM finance_expense_files f
        LEFT JOIN app_users u ON u.id = f.uploaded_by
        WHERE f.expense_id=$1
        ORDER BY f.created_at DESC
        `,
        [req.params.id]
      ),
      query(
        `
        SELECT ff.*, u.full_name, u.email
        FROM finance_expense_feedback ff
        LEFT JOIN app_users u ON u.id = ff.user_id
        WHERE ff.expense_id=$1
        ORDER BY ff.created_at DESC
        `,
        [req.params.id]
      ),
      query(
        `
        SELECT al.*, u.full_name, u.email
        FROM finance_expense_activity_logs al
        LEFT JOIN app_users u ON u.id = al.user_id
        WHERE al.expense_id=$1
        ORDER BY al.created_at DESC
        `,
        [req.params.id]
      ),
    ]);

    return res.json({
      expense: expense.rows[0],
      files: files.rows,
      feedback: feedback.rows,
      activity: activity.rows,
    });
  } catch (error) {
    console.error("Finance expense detail error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createFinanceExpense(req, res) {
  try {
    if (!isFinanceUser(req)) return res.status(403).json({ message: "Forbidden" });
    if (!isUmair(req)) return res.status(403).json({ message: "Only Umair can create expenses" });

    const body = req.body;

    const total =
      Number(body.total ?? 0) ||
      Number(body.amount || 0) + Number(body.tax || 0) - Number(body.discount || 0);

    const result = await query(
      `
      INSERT INTO finance_expenses (
        expense_no,
        category_id,
        title,
        description,
        vendor,
        invoice_number,
        bill_number,
        expense_date,
        payment_date,
        payment_method,
        amount,
        tax,
        discount,
        total,
        currency,
        status,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
      `,
      [
        body.expense_no || buildExpenseNo(),
        body.category_id || null,
        body.title,
        body.description || "",
        body.vendor || "",
        body.invoice_number || "",
        body.bill_number || "",
        body.expense_date || new Date().toISOString().slice(0, 10),
        body.payment_date || null,
        body.payment_method || "cash",
        body.amount || 0,
        body.tax || 0,
        body.discount || 0,
        total,
        body.currency || "PKR",
        body.status || "draft",
        req.user.id,
      ]
    );

    await logExpenseActivity(
      result.rows[0].id,
      req.user.id,
      "expense_created",
      "Expense created by Umair."
    );

    return res.status(201).json({
      message: "Expense created successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Create finance expense error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function updateFinanceExpense(req, res) {
  try {
    if (!isFinanceUser(req)) return res.status(403).json({ message: "Forbidden" });
    if (!isUmair(req)) return res.status(403).json({ message: "Only Umair can edit expenses" });

    const current = await query(
      `SELECT * FROM finance_expenses WHERE id=$1 LIMIT 1`,
      [req.params.id]
    );

    if (!current.rows.length) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (["approved", "paid"].includes(current.rows[0].status)) {
      return res.status(400).json({ message: "Approved or paid expense cannot be edited" });
    }

    const body = req.body;
    const total =
      Number(body.total ?? 0) ||
      Number(body.amount || 0) + Number(body.tax || 0) - Number(body.discount || 0);

    const result = await query(
      `
      UPDATE finance_expenses
      SET
        category_id=$1,
        title=$2,
        description=$3,
        vendor=$4,
        invoice_number=$5,
        bill_number=$6,
        expense_date=$7,
        payment_date=$8,
        payment_method=$9,
        amount=$10,
        tax=$11,
        discount=$12,
        total=$13,
        currency=$14,
        status=$15,
        updated_at=NOW()
      WHERE id=$16
      RETURNING *
      `,
      [
        body.category_id || null,
        body.title,
        body.description || "",
        body.vendor || "",
        body.invoice_number || "",
        body.bill_number || "",
        body.expense_date || new Date().toISOString().slice(0, 10),
        body.payment_date || null,
        body.payment_method || "cash",
        body.amount || 0,
        body.tax || 0,
        body.discount || 0,
        total,
        body.currency || "PKR",
        body.status || current.rows[0].status,
        req.params.id,
      ]
    );

    await logExpenseActivity(
      req.params.id,
      req.user.id,
      "expense_updated",
      "Expense updated by Umair."
    );

    return res.json({
      message: "Expense updated successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Update finance expense error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function submitFinanceExpense(req, res) {
  try {
    if (!isUmair(req)) return res.status(403).json({ message: "Only Umair can submit expenses" });

    const result = await query(
      `
      UPDATE finance_expenses
      SET status='submitted',
          submitted_at=NOW(),
          updated_at=NOW()
      WHERE id=$1
      AND created_by=$2
      AND status IN ('draft','need_correction','rejected')
      RETURNING *
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: "Expense cannot be submitted" });
    }

    await logExpenseActivity(
      req.params.id,
      req.user.id,
      "expense_submitted",
      "Expense submitted for Shahid review."
    );

    return res.json({
      message: "Expense submitted successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Submit expense error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function reviewFinanceExpense(req, res) {
  try {
    if (!isShahid(req)) return res.status(403).json({ message: "Only Shahid can review expenses" });

    const { status, remarks } = req.body;

    const allowed = ["under_review", "approved", "rejected", "need_correction", "paid"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid review status" });
    }

    const result = await query(
      `
      UPDATE finance_expenses
      SET
        status=$1,
        reviewed_by=$2,
        approved_by=CASE WHEN $1 IN ('approved','paid') THEN $2 ELSE approved_by END,
        review_remarks=$3,
        approval_remarks=CASE WHEN $1 IN ('approved','paid') THEN $3 ELSE approval_remarks END,
        reviewed_at=NOW(),
        approved_at=CASE WHEN $1 IN ('approved','paid') THEN NOW() ELSE approved_at END,
        updated_at=NOW()
      WHERE id=$4
      RETURNING *
      `,
      [status, req.user.id, remarks || "", req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await query(
      `
      INSERT INTO finance_expense_feedback
      (expense_id, user_id, remarks, status)
      VALUES ($1,$2,$3,$4)
      `,
      [req.params.id, req.user.id, remarks || "Reviewed.", status]
    );

    await logExpenseActivity(
      req.params.id,
      req.user.id,
      `expense_${status}`,
      remarks || `Expense marked as ${status}.`
    );

    return res.json({
      message: "Expense reviewed successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Review expense error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteFinanceExpense(req, res) {
  try {
    if (!isUmair(req)) return res.status(403).json({ message: "Only Umair can delete expenses" });

    const result = await query(
      `
      DELETE FROM finance_expenses
      WHERE id=$1
      AND created_by=$2
      AND status IN ('draft','rejected','need_correction')
      RETURNING id
      `,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: "Expense cannot be deleted" });
    }

    return res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete finance expense error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function addFinanceExpenseFile(req, res) {
  try {
    if (!isFinanceUser(req)) return res.status(403).json({ message: "Forbidden" });

    const body = req.body;

    const result = await query(
      `
      INSERT INTO finance_expense_files (
        expense_id,
        file_name,
        file_url,
        mime_type,
        file_size,
        file_type,
        uploaded_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        req.params.id,
        body.file_name,
        body.file_url,
        body.mime_type || "",
        body.file_size || 0,
        body.file_type || "receipt",
        req.user.id,
      ]
    );

    await logExpenseActivity(
      req.params.id,
      req.user.id,
      "file_uploaded",
      `File uploaded: ${body.file_name}`
    );

    return res.status(201).json({
      message: "File added successfully",
      file: result.rows[0],
    });
  } catch (error) {
    console.error("Add finance expense file error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
}

export async function deleteFinanceExpenseFile(req, res) {
  try {
    if (!isUmair(req)) return res.status(403).json({ message: "Only Umair can delete files" });

    const result = await query(
      `
      DELETE FROM finance_expense_files
      WHERE id=$1
      RETURNING *
      `,
      [req.params.fileId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "File not found" });
    }

    await logExpenseActivity(
      result.rows[0].expense_id,
      req.user.id,
      "file_deleted",
      `File deleted: ${result.rows[0].file_name}`
    );

    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete finance file error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}