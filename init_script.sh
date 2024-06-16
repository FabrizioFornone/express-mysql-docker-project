#!/bin/bash

# Path to the flag file
FLAG_FILE="/usr/src/app/db-initialized.flag"

# Function to check if migrations and seeding should run
run_migrations_and_seeding() {
  if [ ! -f "$FLAG_FILE" ]; then
    # Flag file doesn't exist, so run migrations and seeding
    echo "Running migrations and seeding"
    
    # Run database migrations
    npm run db-init
    
    # Seed the database
    npm run db-seed

    # Create the flag file to indicate completion
    touch "$FLAG_FILE"
  else
    echo "Migrations and seeding already performed."
  fi
}

# Call the function
run_migrations_and_seeding

# Start the application
npx nodemon -L --watch src src/index.ts