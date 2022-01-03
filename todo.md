[Multer util](./utils/fileStorage.util.js)

-   Conditionally uploads. (i.e., any images uploaded -> '/uploads/images', all other file types -> '/uploads/files')
-   Format original filename to remove any spaces, uppercases, special characters, etc.
-   Format file size output (i.e., '111KB', instead of '111000')

---

[Error Response util](./utils/ErrorResponse.util.js) + (./middleware) + (./controllers)

-   Refactor error util and messages

*   Create and Update currently allows anything. Setup validation

[Team Controller](./controllers/team.controller.js)

-   CreateTeam doesnt allow you to add some fields
