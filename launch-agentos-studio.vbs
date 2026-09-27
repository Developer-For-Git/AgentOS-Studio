Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\LOL\Desktop\AIOS\desktop"
WshShell.Run "cmd /c npm start", 0, False
