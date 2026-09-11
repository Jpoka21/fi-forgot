/** Only OS/runtime locations needed by the locked local test tools survive. */
export function noDatabaseEnvironment(source:NodeJS.ProcessEnv=process.env):NodeJS.ProcessEnv {
  const allowed=new Set(['path','pathext','systemroot','windir','comspec','temp','tmp','userprofile','localappdata','appdata','homedrive','homepath','programfiles','programfiles(x86)','programdata','pnpm_home']);
  const result:NodeJS.ProcessEnv={};
  for(const [key,value] of Object.entries(source))if(allowed.has(key.toLowerCase()))result[key]=value;
  result.BRAIN_QUALIFICATION_MODE='false';result.BRAIN_QUALIFICATION_NO_EXTERNAL='true';
  return result;
}
