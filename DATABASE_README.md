# EdLingo Database Management

This document provides instructions for setting up and managing the EdLingo database schema. To ensure consistency and maintainability, all schema definitions are consolidated into a single file: `src/database/schema.sql`.

## Single Source of Truth

The file `src/database/schema.sql` is the **only** file that should be used to define and update the database schema. This approach provides several benefits:

- **Consistency**: All developers are working with the same schema definition.
- **Version Control**: Changes to the schema can be tracked and managed through Git.
- **Simplicity**: There's no need to hunt for schema changes in multiple files.

## Setting Up the Database

To set up the database for a new environment, follow these steps:

1. **Create a new project** in your Supabase dashboard.
2. **Navigate to the SQL Editor**.
3. **Copy and paste** the entire contents of `src/database/schema.sql` into the SQL Editor.
4. **Run the script** to create all tables, indexes, and policies.

## Making Schema Changes

To make changes to the database schema, follow these steps:

1. **Modify the `src/database/schema.sql` file** to reflect the desired changes. This may include adding, modifying, or deleting tables, columns, or other database objects.
2. **Test the changes** in a development environment to ensure they work as expected.
3. **Apply the changes** to your production environment by running the updated `src/database/schema.sql` script in the Supabase SQL Editor.

By following these guidelines, you can ensure that your database schema remains consistent, maintainable, and easy to manage.