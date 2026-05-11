from functions.get_files_info import get_files_info

one = get_files_info("calculator", ".")
two = get_files_info("calculator", "pkg")
three = get_files_info("calculator", "/bin")
four = get_files_info("calculator", "../")
print(f"Result for current directory:\n{one}")
print(f"Result for 'pkg' directory:\n{two}")
print(f"Result for '/bin' directory:\n{three}")
print(f"Result for '../' directory:\n{four}")
