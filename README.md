# Welcome to Aggie Match

This is a memory match game to match the AggieWorks board member in the least amount of time. The front end is built on React and ChakraUI. The backend uses Supabase and connects to a PostgreSQL database. The game comes with a sign-in/login flow then once logged in the game stores the best times and best moves for a user and has a leaderboard for who has the best time. I built this project exclusively for AggieWorks, starting 10/2/24.


## Next Steps

Currently, I set up the Supabase table by scratch and I didn't have time to hash the passwords. In an actual web application, I would use a hashing algorithm like sha256 to store them. 

## Schema
The Supabase schema includes a primary key for ID which is a unique ID (uuid) as well as fields for username, password (to be hashed), moved, as well as fields for bestMoves and bestTime. 
<img width="1050" alt="Screenshot 2024-10-04 at 2 23 14 PM" src="https://github.com/user-attachments/assets/c9e61a0e-7e75-4196-a1b3-7d2e23a8395b">

## Demo
![ezgif-6-91bf2541e7](https://github.com/user-attachments/assets/3b567213-22e7-450c-a0e3-ccd5e4178b03)
