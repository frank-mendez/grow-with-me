alter table kick_logs
  add constraint kick_logs_user_id_date_key unique (user_id, date);
