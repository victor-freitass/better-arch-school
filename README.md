# Environment Variables
- Change env_file to .env in each folder (source / students / school_team)

# Run Containers
- $ docker compose build --no-cache
- $ docker compose up -d

# Documentation 
- School_team API - http://localhost:3000/api-documentation
- Students API - http://localhost:8080/api-documentation 

# The project
It's a school project.
School that has 3 types of workers: Directors, coordinators and teachers.
Each with their own permissions. Everything is validated.

The registration of workers and students is carried out, which only directors and coordinators can do. And then you can log in (signin) and use the project with the token.

The school has a social network, I thought this was innovative for a school so I wanted to include it in the project:
Everyone has a profile with a photo, students can post photos, send messages to workers and chat with other students based on their friends list.