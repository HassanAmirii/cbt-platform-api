```txt
TODO(later): two-phase exam preview endpoint
POST /exam/preview → validate + return metadata (no clock start)
POST /exam/start → starts clock, returns questions
Trigger: Checking if a student has remaining attempts before they commit
Pulling course-specific instructions from the DB to show in the lobby
Enforcing a scheduled exam window (exam only opens at 2pm, etc.)
Anti-cheat logging (tracking when they entered the lobby vs. when they actually started)
```
