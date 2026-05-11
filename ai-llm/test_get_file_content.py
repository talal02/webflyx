from functions.get_file_content import get_file_content

one = get_file_content("calculator", "lorem.txt")
two = get_file_content("calculator", "main.py")
three = get_file_content("calculator", "pkg/calculator.py")
four = get_file_content("calculator", "/bin/cat")
five = get_file_content("calculator", "pkg/does_not_exist.py")
print(f"Result for current directory:\n{one}")
print(f"Result for 'main.py' file:\n{two}")
print(f"Result for 'pkg/calculator.py' file:\n{three}")
print(f"Result for '/bin/cat' file:\n{four}")
print(f"Result for 'pkg/does_not_exist.py' file:\n{five}")
