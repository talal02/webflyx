import os
from google.genai import types

schema_get_files_info = types.FunctionDeclaration(
    name="get_files_info",
    description="Lists files in a specified directory relative to the working directory, providing file size and directory status",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "directory": types.Schema(
                type=types.Type.STRING,
                description="Directory path to list files from, relative to the working directory (default is the working directory itself)",
            ),
        },
    ),
)

def get_files_info(working_directory, directory="."):
  abs_path = os.path.abspath(working_directory)
  target_directory = os.path.join(abs_path, directory)
  target_directory = os.path.normpath(target_directory)
  valid_target_directory = os.path.commonpath([abs_path, target_directory]) == abs_path
  if not valid_target_directory:
    return f'Error: Cannot list "{directory}" as it is outside the permitted working directory'
  contents = os.listdir(target_directory)
  files_info = ""
  for content in contents:
    content_path = os.path.join(target_directory, content)
    if os.path.isfile(content_path):
      file_size = os.path.getsize(content_path)
      files_info += f"  - {content}: file_size={file_size} bytes, is_dir=False\n"
    elif os.path.isdir(content_path):
      dir_size = sum(os.path.getsize(os.path.join(root, file)) for root, _, files in os.walk(content_path) for file in files)
      files_info += f"  - {content}: file_size={dir_size} bytes, is_dir=True\n"
  return files_info
