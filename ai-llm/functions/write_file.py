import os
from google.genai import types

schema_write_file = types.FunctionDeclaration(
    name="write_file",
    description="Writes specified content to a file at a given path relative to the working directory. If the file already exists, it will be overwritten. Returns a success message or an error if the operation fails.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "file_path": types.Schema(
                type=types.Type.STRING,
                description="Path to the file to write to, relative to the working directory",
            ),
            "content": types.Schema(
                type=types.Type.STRING,
                description="The content to write to the file",
            ),
        },
    ),
)

def write_file(working_directory, file_path, content):
  try:
    abs_path = os.path.abspath(working_directory)
    target_file_path = os.path.join(abs_path, file_path)
    target_file_path = os.path.normpath(target_file_path)
    valid_target_file_path = os.path.commonpath([abs_path, target_file_path]) == abs_path
    if not valid_target_file_path:
      return f'Error: Cannot write to "{file_path}" as it is outside the permitted working directory'
    if os.path.isdir(target_file_path):
      return f'Error: Cannot write to "{file_path}" as it is a directory'
    with open(target_file_path, 'w') as file:
      file.write(content)
    return f'Successfully wrote to "{file_path}" ({len(content)} characters written)'
  except Exception as e:
    return f'Error: writing to file "{file_path}": {str(e)}'