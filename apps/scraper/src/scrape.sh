#!/bin/bash

start_time=$(date +%s)
TOTAL_SUBJECTS=$(curl "${DB_ENDPOINT}?select=subject&order=subject.asc" \
-H "apikey: $KEY" \
-H "Authorization: Bearer $KEY" | jq length)

LIMIT=5
OFFSET=$(($TOTAL_SUBJECTS / $LIMIT + 1))

for ((i=0; i<=$OFFSET; i++))
do
  CURR_OFFSET=$((i * $LIMIT))
  SUBJECTS=$(curl --silent "${DB_ENDPOINT}?select=subject&order=subject.asc&limit=$LIMIT&offset=$CURR_OFFSET" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" | jq -c '[.[] | .subject]')

  pnpm tsx --no-deprecation src/index.ts "$SUBJECTS"

  curr_end_time=$(date +%s)
  curr_execution_time=$((curr_end_time - start_time))
  echo "Execution time so far: $curr_execution_time seconds"
done


end_time=$(date +%s)
execution_time=$((end_time - start_time))
echo "Total Execution time: $execution_time seconds"
