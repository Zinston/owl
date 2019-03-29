import { SAMPLES } from "./samples.js";

const { QWeb, Component } = owl.core;

const MODES = {
  js: "ace/mode/javascript",
  css: "ace/mode/css",
  xml: "ace/mode/xml"
};

const TEMPLATE = `
  <div class="playground">
      <div class="left-bar">
        <div class="menubar">
          <a class="tab" t-att-class="{active: state.currentTab==='js'}" t-on-click="setTab('js')">JS</a>
          <a class="tab" t-att-class="{active: state.currentTab==='css'}" t-on-click="setTab('css')">CSS</a>
          <a class="tab" t-att-class="{active: state.currentTab==='xml'}" t-on-click="setTab('xml')">XML</a>
          <div class="right-thing">
            <select t-on-change="setSample">
              <option t-foreach="SAMPLES" t-as="sample">
                <t t-esc="sample.description"/>
              </option>
            </select>
            <a class="btn run-code" t-on-click="runCode">▶ Run</a>
          </div>
        </div>
        <div class="code-editor" t-ref="editor"></div>
      </div>
      <div class="content" t-ref="content">
        <div class="welcome">
          <div>🦉 Odoo Web Lab 🦉</div>
          <div>v<t t-esc="version"/></div>
          <div class="url"><a href="https://github.com/ged-odoo/web-core">https://github.com/ged-odoo/web-core</a></div>
          <div class="note">Note: these examples require a recent browser to work without a transpilation step. </div>
        </div>
      </div>
  </div>`;

class Playground extends Component {
  constructor(...args) {
    super(...args);
    this.version = owl._version;
    this.SAMPLES = SAMPLES;
    this.inlineTemplate = TEMPLATE;
    this.state = {
      currentTab: "js",
      js: SAMPLES[0].code,
      css: "",
      xml: ""
    };
  }

  mounted() {
    this.editor = ace.edit(this.refs.editor);
    this.editor.session.setOption("useWorker", false);
    this.editor.setValue(this.state.js, -1);
    this.editor.setFontSize("14px");
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/javascript");
  }

  runCode() {
    this.updateStateFromEditor();

    // inject js
    const iframe = document.createElement("iframe");
    iframe.src = "playground-iframe.html";

    iframe.onload = () => {
      const doc = iframe.contentWindow.document;
      const script = doc.createElement("script");
      script.type = "text/javascript";
      script.innerHTML = this.state.js;
      doc.body.appendChild(script);

      // inject css
      const link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.innerHTML = this.state.css;
      doc.body.appendChild(link);
    };

    this.refs.content.innerHTML = "";
    this.refs.content.appendChild(iframe);
  }

  setSample(ev) {
    const sample = SAMPLES.find(s => s.description === ev.target.value);
    this.editor.setValue(sample.code, -1);
  }

  updateStateFromEditor() {
    const value = this.editor.getValue();
    this.updateState({
      [this.state.currentTab]: value
    });
  }

  setTab(tab) {
    this.updateStateFromEditor();
    this.editor.setValue(this.state[tab], -1);

    const mode = MODES[tab];
    this.editor.session.setMode(mode);
    this.updateState({ currentTab: tab });
  }
}

document.addEventListener("DOMContentLoaded", async function() {
  const qweb = new QWeb();
  const env = { qweb };
  const playground = new Playground(env);
  playground.mount(document.body);
});