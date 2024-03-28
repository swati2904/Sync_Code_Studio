import React, { useEffect } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

const Editor = () => {
  useEffect(() => {
    const editor = CodeMirror.fromTextArea(
      document.getElementById("realTimeEditor"),
      {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
    );

    return () => {
      editor.toTextArea();
    };
  }, []);

  return <textarea id="realTimeEditor"></textarea>;
};

export default Editor;
