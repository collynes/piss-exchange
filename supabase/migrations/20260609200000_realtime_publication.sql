-- The app subscribes to postgres_changes on bids, listings and trades
-- (OrderBookClient live order book, NotificationBell), but no table was
-- ever added to the supabase_realtime publication, so none of those
-- events fired. Add them. RLS still applies to delivered rows; all three
-- tables are publicly readable (the order book is public).
alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table listings;
alter publication supabase_realtime add table trades;
