param([switch]$Closed)
$ErrorActionPreference='Stop'
$processes=@(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'")
if($Closed){@{chromeProcesses=$processes.Count}|ConvertTo-Json -Compress;exit}
$expected='C:\BrowserSmokeRuntime\chrome\chrome.exe'
$owned=@($processes|Where-Object {$_.ExecutablePath -eq $expected -and $_.CommandLine -notmatch '(?:^|\s)--type='})
if($owned.Count -ne 1){throw 'Expected exactly one owned main Chrome process'}
$line=$owned[0].CommandLine;$match=[regex]::Match($line,'--user-data-dir=(?:"([^"]+)"|(\S+))')
$profile=if($match.Groups[1].Success){$match.Groups[1].Value}else{$match.Groups[2].Value}
$private=$false;if($profile){$private=[IO.Path]::GetFullPath($profile).StartsWith('C:\BrowserWorkflowTemp\',[StringComparison]::OrdinalIgnoreCase)}
@{mainProcesses=$owned.Count;pid=$owned[0].ProcessId;pipeObserved=($line -match '(?:^|\s)--remote-debugging-pipe(?:\s|$)');noSandboxSwitchAbsent=($line -notmatch '(?:^|\s)--no-sandbox(?:\s|$)');privateProfileObserved=$private;exactExecutableObserved=($owned[0].ExecutablePath -eq $expected)}|ConvertTo-Json -Compress
