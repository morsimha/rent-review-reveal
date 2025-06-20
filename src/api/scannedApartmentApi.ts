const { data, error } = await supabase.functions.invoke('yad2-scanner', {
  body: { searchQuery },
  headers: {
    'Content-Type': 'application/json',
  }
});
