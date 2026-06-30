import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
} from "lucide-react";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../services/notificationsApi";

export default function NotificationsPage() {

  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);

  async function loadNotifications(){
    try{
      setLoading(true);

      const data=await fetchNotifications();

      setNotifications(data.notifications||[]);

    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{
    loadNotifications();
  },[]);

  async function read(id){

    await markNotificationRead(id);

    loadNotifications();

  }

  async function readAll(){

    await markAllNotificationsRead();

    loadNotifications();

  }

  async function remove(id){

    if(!window.confirm("Delete notification?")) return;

    await deleteNotification(id);

    loadNotifications();

  }

  return(

<div>

<div className="dashboard-header">

<div>

<h1>Notifications</h1>

<p>All your recent notifications.</p>

</div>

<div className="header-actions">

<button
className="employee-add-btn"
onClick={readAll}
>

<CheckCheck size={18}/>

Mark All Read

</button>

</div>

</div>

<div className="dashboard-card">

{loading ? (

<p>Loading...</p>

):(

<div className="dashboard-list">

{notifications.map((item)=>(

<div
key={item.id}
className={`notification-card ${item.is_read?"":"notification-unread"}`}
>

<div className="notification-left">

<div className="stat-icon">

<Bell size={20}/>

</div>

<div>

<strong>{item.title}</strong>

<p>{item.message}</p>

<span>

{new Date(item.created_at).toLocaleString()}

</span>

</div>

</div>

<div className="notification-actions">

{!item.is_read && (

<button
onClick={()=>read(item.id)}
>

<Check size={16}/>

Read

</button>

)}

<button
className="danger"
onClick={()=>remove(item.id)}
>

<Trash2 size={16}/>

Delete

</button>

</div>

</div>

))}

</div>

)}

</div>

</div>

  );

}
