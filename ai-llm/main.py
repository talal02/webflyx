import os
import argparse
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")

from google import genai
from google.genai import types
from prompts import system_prompt
from functions.get_files_info import schema_get_files_info
from functions.get_file_content import schema_get_file_content
from functions.write_file import schema_write_file
from functions.run_python_file import schema_run_python_file
from call_function import call_function

parser = argparse.ArgumentParser(description="Chatbot")
parser.add_argument("user_prompt", type=str, help="User prompt")
parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
args = parser.parse_args()

available_functions = types.Tool(
    function_declarations=[schema_get_files_info, schema_get_file_content, schema_write_file, schema_run_python_file],
)

if args.user_prompt:
	messages = [types.Content(role="user", parts=[types.Part(text=args.user_prompt)])]
	client = genai.Client(api_key=api_key)

	if args.verbose:
		print(f"User prompt: {args.user_prompt}")

	max_iters = 20
	for iteration in range(max_iters):
		content = client.models.generate_content(
			model="gemini-2.5-flash",
			contents=messages,
			config=types.GenerateContentConfig(tools=[available_functions], system_instruction=system_prompt),
		)

		if content.usage_metadata and args.verbose:
			print(f"Prompt tokens: {content.usage_metadata.prompt_token_count}")
			print(f"Response tokens: {content.usage_metadata.candidates_token_count}")
		elif args.verbose:
			print(f"Error: {content.text}, Content: {content}")

		# Add model candidates to the conversation history so the model can see them
		candidates = getattr(content, "candidates", []) or []
		for cand in candidates:
			cand_content = getattr(cand, "content", None)
			if cand_content is None:
				continue
			# cand_content may be a list of Content objects or a single Content
			if isinstance(cand_content, list):
				messages.extend(cand_content)
			else:
				messages.append(cand_content)

		# If the model didn't request any functions, it's a final response
		func_calls = getattr(content, "function_calls", []) or []
		if not func_calls:
			# Print final text if available, otherwise print candidate text
			print("Final response:")
			if content.text:
				print(content.text)
			else:
				for cand in candidates:
					print(getattr(cand, "text", None) or getattr(cand, "content", cand))
			break

		# Otherwise, call each requested function and collect their responses
		function_results = []
		for func_call in func_calls:
			function_call_result = call_function(func_call, verbose=args.verbose)

			if not getattr(function_call_result, "parts", None):
				raise RuntimeError("function_call_result.parts is empty")

			function_response = function_call_result.parts[0].function_response
			if function_response is None:
				raise RuntimeError("function_response is None")

			if function_response.response is None:
				raise RuntimeError("function_response.response is None")

			# Add the Part (tools expect parts) to the function results list
			function_results.append(function_call_result.parts[0])

			if args.verbose:
				print(f"-> {function_call_result.parts[0].function_response.response}")

		# Append the collected tool responses to messages so the model can see them
		if function_results:
			messages.append(types.Content(role="user", parts=function_results))
	else:
		# Loop exhausted without final response
		print(f"Max iterations ({max_iters}) reached without a final response")
		raise SystemExit(1)

 
