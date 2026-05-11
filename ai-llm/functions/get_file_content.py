import os
from google.genai import types

schema_get_file_content = types.FunctionDeclaration(
    name="get_file_content",
    description="Reads the content of a specified file relative to the working directory, with a maximum character limit to prevent excessive output",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "file_path": types.Schema(
                type=types.Type.STRING,
                description="Path to the file to read, relative to the working directory",
            ),
        },
    ),
)

MAX_CHARS = 10000

def get_file_content(working_directory, file_path):
  try:
    abs_path = os.path.abspath(working_directory)
    target_file_path = os.path.join(abs_path, file_path)
    target_file_path = os.path.normpath(target_file_path)
    valid_target_file_path = os.path.commonpath([abs_path, target_file_path]) == abs_path
    if not valid_target_file_path:
      return f'Error: Cannot read "{file_path}" as it is outside the permitted working directory'
    if not os.path.isfile(target_file_path):
      return f'Error: File not found or is not a regular file: "{file_path}"'
    with open(target_file_path, 'r') as file:
      content = file.read(MAX_CHARS)
      if file.read(1):
        content += f'[...File "{file_path}" truncated at {MAX_CHARS} characters]'
    return content
  except Exception as e:
    return f'Error: reading file "{file_path}": {str(e)}'