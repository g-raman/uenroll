import supabase from '../supabase.ts';
import { term } from './types.ts';

const getAvailableTerms = async (): Promise<term[]> => {
  console.log('Fetching available terms...');
  const res = await supabase.from('availableTerms').select('term,value').order('term', { ascending: true });
  if (res.error) {
    console.error('Error: Something went wrong when fetching list of available terms');
    console.log(res.error);
    console.log();
  }

  const terms = res.data as term[];
  console.log('Available terms fetched\n');
  return terms;
};

export default getAvailableTerms;
