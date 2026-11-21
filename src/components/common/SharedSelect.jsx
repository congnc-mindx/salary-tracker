import {Children, isValidElement} from "react";
import SelectField from "./SelectField";
function optionsOf(children) {
 return Children.toArray(children).flatMap(child=> {
  if(!isValidElement(child)) return [];
  if(child.type === "option") { const text=Children.toArray(child.props.children).join("");return [{value:String(child.props.value ?? text),label:text,disabled:child.props.disabled}]; }
  return optionsOf(child.props.children);
 });
}
export default function SharedSelect({children,value,onChange,disabled,className,"aria-label":ariaLabel}) {
 return <div className={className?.includes("mt-") ? "mt-1 min-w-0" : "min-w-0"}><SelectField value={String(value ?? "")} onChange={value=>onChange?.({target:{value}})} disabled={disabled} ariaLabel={ariaLabel} options={optionsOf(children)}/></div>;
}
