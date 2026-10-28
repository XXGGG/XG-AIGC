/* 复制到剪贴板：局域网 http 地址不是安全上下文，浏览器不给 navigator.clipboard，用隐藏文本框 + execCommand 兜底 */
function legacy(txt){
  const ta=document.createElement("textarea");
  ta.value=txt;ta.setAttribute("readonly","");
  ta.style.cssText="position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,txt.length);
  let ok=false;try{ok=document.execCommand("copy")}catch(e){}
  ta.remove();return ok;
}
export function copyText(txt){
  if(!txt)return Promise.resolve(false);
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(txt).then(()=>true,()=>legacy(txt));
  return Promise.resolve(legacy(txt));
}
