import os
import subprocess

from google.genai import types

schema_run_python_file = types.FunctionDeclaration(
    name="run_python_file",
    description="Executes a specified Python file relative to the working directory, with optional command-line arguments. Captures and returns both standard output and standard error, along with the exit code.",
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "file_path": types.Schema(
                type=types.Type.STRING,
                description="Path to the Python file to execute, relative to the working directory",
            ),
            "args": types.Schema(
                type=types.Type.ARRAY,
                items=types.Schema(type=types.Type.STRING),
                description="Optional list of command-line arguments to pass to the Python script",
            ),
        },
    ),
)

def run_python_file(working_directory, file_path, args=None):
  try:
    abs_path = os.path.abspath(working_directory)
    target_file_path = os.path.join(abs_path, file_path)
    target_file_path = os.path.normpath(target_file_path)
    valid_target_file_path = os.path.commonpath([abs_path, target_file_path]) == abs_path
    if not valid_target_file_path:
      return f'Error: Cannot execute "{file_path}" as it is outside the permitted working directory'
    if not os.path.isfile(target_file_path):
      return f'Error: "{file_path}" does not exist or is not a regular file'
    if not target_file_path.endswith('.py'):
      return f'Error: "{file_path}" is not a Python file'
    command = ["python", target_file_path]
    if args:
      command += args
      # use .run, get stdout and stderr, and returncode
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
      return f'STDERR: Process exited with code {result.returncode}: {result.stderr.strip()}'
    if not result.stdout.strip() and not result.stderr.strip():
      return f'No output produced'
    return f'STDOUT: {result.stdout.strip()}\nSTDERR: {result.stderr.strip()}'
  except subprocess.CalledProcessError as e:
    return f'Error: executing Python file: {e}'