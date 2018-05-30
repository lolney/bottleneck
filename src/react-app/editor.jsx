import React from 'react';
import { renderToString } from 'react-dom/server';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/github';

import './CSS/Editor.scss';


export default class Editor extends React.Component {
	render() {
	return(
	<div>
	<fieldset>
<img src="https://avatars2.githubusercontent.com/u/8031562?s=400&u=f5735733f4049e4b75af582407b6766262465827&v=4" />
<title>Editor</title>
<label>Theme:
<select id="game-theme" size="1">
  <optgroup label="bright">
    <option value="chrome">chrome</option>
    <option value="clouds">clouds</option>
    <option value="crimson_editor">crimson_editor</option>
    <option value="dawn">dawn</option>
    <option value="dreamweaver">dreamweaver</option>
    <option value="eclipse">eclipse</option>
    <option value="github">github</option>
    <option value="solarized_light">solarized_light</option>
    <option value="textmate">textmate</option>
    <option value="tomorrow" defaultValue>tomorrow</option>
    <option value="xcode">xcode</option>
  </optgroup>
  <optgroup label="dark">
    <option value="clouds_midnight">clouds_midnight</option>
    <option value="cobalt">cobalt</option>
    <option value="idle_fingers">idle_fingers</option>
    <option value="kr_theme">kr_theme</option>
    <option value="merbivore">merbivore</option>
    <option value="merbivore_soft">merbivore_soft</option>
    <option value="mono_industrial">mono_industrial</option>
    <option value="monokai">monokai</option>
    <option value="pastel_on_dark">pastel_on_dark</option>
    <option value="solarized_dark">solarized_dark</option>
    <option value="terminal">terminal</option>
    <option value="tomorrow_night">tomorrow_night</option>
    <option value="tomorrow_night_blue">tomorrow_night_blue</option>
    <option value="tomorrow_night_bright">tomorrow_night_bright</option>
    <option value="tomorrow_night_eighties">tomorrow_night_eighties</option>
    <option value="twilight">twilight</option>
    <option value="vibrant_ink">vibrant_ink</option>
  </optgroup>
</select>
</label>  

<label>Mode:  
<select id="ace-mode">
  <option value="ABAP">ABAP</option>
  <option value="ActionScript">ActionScript</option>
  <option value="ADA">ADA</option>
  <option value="Apache Conf">Apache Conf</option>
  <option value="AsciiDoc">AsciiDoc</option>
  <option value="Assembly x86">Assembly x86</option>
  <option value="AutoHotKey">AutoHotKey</option>
  <option value="BatchFile">BatchFile</option>
  <option value="C/C++">C/C++</option>
  <option value="C#">C#</option>
  <option value="C9 Search Results">C9 Search Results</option>
  <option value="Cirru">Cirru</option>
  <option value="Clojure">Clojure</option>
  <option value="Cobol">Cobol</option>
  <option value="CoffeeScript">CoffeeScript</option>
  <option value="ColdFusion">ColdFusion</option>
  <option value="CSS">CSS</option>
  <option value="Curly">Curly</option>
  <option value="D">D</option>
  <option value="Dart">Dart</option>
  <option value="Diff">Diff</option>
  <option value="Dockerfile">Dockerfile</option>
  <option value="Dot">Dot</option>
  <option value="EJS">EJS</option>
  <option value="Erlang">Erlang</option>
  <option value="Forth">Forth</option>
  <option value="FreeMarker">FreeMarker</option>
  <option value="Gherkin">Gherkin</option>
  <option value="Gitignore">Gitignore</option>
  <option value="Glsl">Glsl</option>
  <option value="Go">Go</option>
  <option value="Groovy">Groovy</option>
  <option value="HAML">HAML</option>
  <option value="Handlebars">Handlebars</option>
  <option value="Haskell">Haskell</option>
  <option value="haXe">haXe</option>
  <option value="HTML">HTML</option>
  <option value="HTML (Ruby)">HTML (Ruby)</option>
  <option value="INI">INI</option>
  <option value="Jack">Jack</option>
  <option value="Jade">Jade</option>
  <option value="Java">Java</option>
  <option value="JavaScript">JavaScript</option>
  <option value="JSON">JSON</option>
  <option value="JSONiq">JSONiq</option>
  <option value="JSP">JSP</option>
  <option value="JSX">JSX</option>
  <option value="Julia">Julia</option>
  <option value="LaTeX">LaTeX</option>
  <option value="LESS">LESS</option>
  <option value="Liquid">Liquid</option>
  <option value="Lisp">Lisp</option>
  <option value="LiveScript">LiveScript</option>
  <option value="LogiQL">LogiQL</option>
  <option value="LSL">LSL</option>
  <option value="Lua">Lua</option>
  <option value="LuaPage">LuaPage</option>
  <option value="Lucene">Lucene</option>
  <option value="Makefile">Makefile</option>
  <option value="Markdown">Markdown</option>
  <option value="MATLAB">MATLAB</option>
  <option value="MEL">MEL</option>
  <option value="MUSHCode">MUSHCode</option>
  <option value="MySQL">MySQL</option>
  <option value="Nix">Nix</option>
  <option value="Nix">Nix</option>
  <option value="Objective-C">Objective-C</option>
  <option value="OCaml">OCaml</option>
  <option value="Pascal">Pascal</option>
  <option value="Perl">Perl</option>
  <option value="pgSQL">pgSQL</option>
  <option value="PHP">PHP</option>
  <option value="Plain Text">Plain Text</option>
  <option value="Powershell">Powershell</option>
  <option value="Prolog">Prolog</option>
  <option value="Properties">Properties</option>
  <option value="Protobuf">Protobuf</option>
  <option value="Python">Python</option>
  <option value="R">R</option>
  <option value="RDoc">RDoc</option>
  <option value="RHTML">RHTML</option>
  <option value="Ruby">Ruby</option>
  <option value="Rust">Rust</option>
  <option value="SASS">SASS</option>
  <option value="SCAD">SCAD</option>
  <option value="Scala">Scala</option>
  <option value="Scheme">Scheme</option>
  <option value="SCSS" defaultValue>SCSS</option>
  <option value="SH">SH</option>
  <option value="SJS">SJS</option>
  <option value="Smarty">Smarty</option>
  <option value="snippets">snippets</option>
  <option value="Soy Template">Soy Template</option>
  <option value="Space">Space</option>
  <option value="SQL">SQL</option>
  <option value="Stylus">Stylus</option>
  <option value="SVG">SVG</option>
  <option value="Tcl">Tcl</option>
  <option value="Tex">Tex</option>
  <option value="Text">Text</option>
  <option value="Textile">Textile</option>
  <option value="Toml">Toml</option>
  <option value="Twig">Twig</option>
  <option value="Typescript">Typescript</option>
  <option value="Vala">Vala</option>
  <option value="VBScript">VBScript</option>
  <option value="Velocity">Velocity</option>
  <option value="Verilog">Verilog</option>
  <option value="XML">XML</option>
  <option value="XQuery">XQuery</option>
  <option value="YAML">YAML</option>
</select>
</label> 

</fieldset> 
<div className="wrapper">
  <AceEditor
    mode="java"
    theme="github"
//  onChange={onChange}
    name="UNIQUE_ID_OF_DIV"
    editorProps={{$blockScrolling: true}}
  />
</div>
</div>
);
}
}
