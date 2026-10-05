import subprocess

tests = [
    (
        "TEST 1: Duplicate Registration (User 5 in Hackathon 1)",
        "INSERT INTO registrations (hackathon_id, user_id, status) VALUES (1, 5, 'REGISTERED');"
    ),
    (
        "TEST 2: Duplicate Team Membership (User 5 in Team 1)",
        "INSERT INTO team_members (team_id, user_id, role_in_team) VALUES (1, 5, 'MEMBER');"
    ),
    (
        "TEST 3: Invalid Team Sizes (min_team_size = 5 > max_team_size = 2)",
        "INSERT INTO hackathons (organizer_id, title, description, start_date, end_date, registration_deadline, min_team_size, max_team_size, status) VALUES (2, 'Bad Size', 'Desc', '2026-11-01 09:00:00', '2026-11-03 18:00:00', '2026-10-25 23:59:59', 5, 2, 'UPCOMING');"
    ),
    (
        "TEST 4: Invalid Date Range (end_date < start_date)",
        "INSERT INTO hackathons (organizer_id, title, description, start_date, end_date, registration_deadline, min_team_size, max_team_size, status) VALUES (2, 'Bad Dates', 'Desc', '2026-11-10 09:00:00', '2026-11-05 18:00:00', '2026-11-02 23:59:59', 1, 4, 'UPCOMING');"
    ),
    (
        "TEST 5: Foreign Key Violation (Non-existent user_id = 99999)",
        "INSERT INTO registrations (hackathon_id, user_id, status) VALUES (1, 99999, 'REGISTERED');"
    ),
    (
        "TEST 6: Duplicate Team Project Idea (Team 1 submitting 2nd idea for Hackathon 1)",
        "INSERT INTO project_ideas (hackathon_id, submitted_by_user_id, team_id, title, abstract, is_public, submission_status) VALUES (1, 5, 1, 'Duplicate Team Project', 'Desc', TRUE, 'SUBMITTED');"
    )
]

with open("/mnt/e/Hackhub/backend/sql/constraint_test_results.txt", "w") as out:
    for name, sql in tests:
        cmd = ["mysql", "-u", "root", "-prootpassword", "-D", "hackhub_db", "-e", sql]
        p = subprocess.run(cmd, capture_output=True, text=True)
        out.write(f"=== {name} ===\n")
        out.write(f"SQL: {sql}\n")
        out.write(f"Exit Code: {p.returncode}\n")
        # Filter mysql password warning line for clean output
        stderr_lines = [l for l in p.stderr.strip().split("\n") if "Using a password on the command line" not in l]
        error_msg = "\n".join(stderr_lines).strip()
        out.write(f"Database Response: {error_msg}\n")
        out.write(f"Result: {'REJECTED (EXPECTED)' if p.returncode != 0 else 'ALLOWED (UNEXPECTED)'}\n\n")

print("Constraint tests completed.")
