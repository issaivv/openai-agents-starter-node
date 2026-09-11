import type React from 'react';
import styles from './CodeViewer.module.css';

/* ── Token factory ── */
const token = (cls: string) =>
  function Token({ t }: { t: string }) { return <span className={cls}>{t}</span>; };

const Cmt = token(styles.cmt);
const Kw  = token(styles.kw);
const Fn  = token(styles.fn);
const Ty  = token(styles.ty);
const Str = token(styles.str);
const Op  = token(styles.op);
const Va  = token(styles.va);

interface LineProps { n: number; children?: React.ReactNode }
const L = ({ n, children }: LineProps) => (
  <div className={styles.line}>
    <span className={styles.ln}>{String(n).padStart(2, ' ')}</span>
    <span className={styles.lc}>{children ?? ' '}</span>
  </div>
);

/* Indentation shorthand */
const I = () => <span className={styles.indent} />;
const I2 = () => <><span className={styles.indent} /><span className={styles.indent} /></>;

export default function CodeViewer() {
  return (
    <div className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.fileIcon}>⬡</span>
          <span className={styles.filename}>index.ts<span className={styles.sep}></span></span>
        </div>
        <span className={styles.badge}>READ ONLY</span>
      </div>

      {/* ── Code body ── */}
      <div className={styles.body}>
        {/* CRT scanline overlay */}
        <div className={styles.scanline} aria-hidden />

        <div className={styles.code}>
          {/* ── Imports ── */}
          <L n={1}>
            <Kw t="import " /><Op t="{ " /><Ty t="Agent" /><Op t=", " /><Fn t="run" /><Op t=", " /><Fn t="tool" /><Op t=" } " />
            <Kw t="from " /><Str t="'@openai/agents'" /><Op t=";" />
          </L>
          <L n={2}>
            <Kw t="import " /><Op t="{ " /><Va t="z" /><Op t=" } " />
            <Kw t="from " /><Str t="'zod'" /><Op t=";" />
          </L>
          <L n={3}>
            <Kw t="import " /><Va t="OpenAI" />
            <Kw t=" from " /><Str t="'openai'" /><Op t=";" />
          </L>
          <L n={4} />

          {/* ── Instructions constant ── */}
          <L n={5}>
            <Kw t="const " /><Va t="INSTRUCTIONS" /><Op t=" = " /><Str t="`...`" /><Op t=";" />
          </L>
          <L n={6} />

          {/* ── onRequest handler ── */}
          <L n={7}>
            <Kw t="export " /><Kw t="async " /><Kw t="function " /><Fn t="onRequest" />
            <Op t="(" /><Va t="context" /><Op t=": " /><Ty t="any" /><Op t=") {" />
          </L>
          <L n={8}>
            <I /><Kw t="const " /><Va t="message" /><Op t=" = " />
            <Va t="context" /><Op t="." /><Va t="request" /><Op t="." /><Va t="body" />
            <Op t="?." /><Va t="message" /><Op t=" ?? " /><Str t="''" /><Op t=";" />
          </L>
          <L n={9}>
            <I /><Kw t="const " /><Va t="conversationId" /><Op t=" = " />
            <Va t="context" /><Op t="." /><Va t="conversation_id" /><Op t=";" />
          </L>
          <L n={10}>
            <I /><Kw t="const " /><Va t="store" /><Op t=" = " />
            <Va t="context" /><Op t="." /><Va t="store" /><Op t=";" />
          </L>
          <L n={11} />

          {/* ── Step 1: Store user message ── */}
          <L n={12}>
            <I /><Cmt t="// 1. EdgeOne Store: save user message for history restore" />
          </L>
          <L n={13}>
            <I /><Kw t="await " /><Va t="store" /><Op t="?." /><Fn t="appendMessage" /><Op t="?.({" />
          </L>
          <L n={14}>
            <I2 /><Va t="conversationId" /><Op t="," />
          </L>
          <L n={15}>
            <I2 /><Va t="role" /><Op t=": " /><Str t="'user'" /><Op t="," />
          </L>
          <L n={16}>
            <I2 /><Va t="content" /><Op t=": " /><Va t="message" /><Op t="," />
          </L>
          <L n={17}>
            <I /><Op t="});" />
          </L>
          <L n={18} />

          {/* ── Step 2: Inject session memory ── */}
          <L n={19}>
            <I /><Cmt t="// 2. EdgeOne Store: inject OpenAI Agents SDK session memory" />
          </L>
          <L n={20}>
            <I /><Kw t="const " /><Va t="session" /><Op t=" = " />
            <Va t="store" /><Op t="?." /><Fn t="openaiSession" /><Op t="?.(" /><Va t="conversationId" /><Op t=");" />
          </L>
          <L n={21} />

          {/* ── Step 3: Define tools ── */}
          <L n={22}>
            <I /><Cmt t="// 3. Use Agent tools defined in this project" />
          </L>
          <L n={23}>
            <I /><Kw t="const " /><Va t="getWeather" /><Op t=" = " /><Fn t="tool" /><Op t="({" />
          </L>
          <L n={24}>
            <I2 /><Va t="name" /><Op t=": " /><Str t="'get_weather'" /><Op t="," />
          </L>
          <L n={25}>
            <I2 /><Va t="description" /><Op t=": " /><Str t="'Get the current weather...'" /><Op t="," />
          </L>
          <L n={26}>
            <I2 /><Va t="parameters" /><Op t=": " /><Va t="z" /><Op t="." /><Fn t="object" /><Op t="({" />
          </L>
          <L n={27}>
            <I2 /><I /><Va t="city" /><Op t=": " /><Va t="z" /><Op t="." /><Fn t="string" /><Op t="()." />
            <Fn t="describe" /><Op t="(" /><Str t="'city'" /><Op t=")," />
          </L>
          <L n={28}>
            <I2 /><Op t="})," />
          </L>
          <L n={29}>
            <I2 /><Va t="execute" /><Op t=": " /><Kw t="async " /><Op t="({ " /><Va t="city" /><Op t=" }) => { ... }," />
          </L>
          <L n={30}>
            <I /><Op t="});" />
          </L>
          <L n={31} />
          <L n={32}>
            <I /><Kw t="const " /><Va t="tools" /><Op t=" = [" />
          </L>
          <L n={33}>
            <I2 /><Va t="getWeather" /><Op t="," />
          </L>
          <L n={34}>
            <I2 /><Cmt t="// More tools..." />
          </L>
          <L n={35}>
            <I /><Op t="];" />
          </L>
          <L n={36} />

          {/* ── Step 4: Create Agent ── */}
          <L n={37}>
            <I /><Cmt t="// 4. Create OpenAI Agent" />
          </L>
          <L n={38}>
            <I /><Kw t="const " /><Va t="agent" /><Op t=" = " /><Kw t="new " /><Ty t="Agent" /><Op t="({" />
          </L>
          <L n={39}>
            <I2 /><Va t="name" /><Op t=": " /><Str t="'EdgeOne Assistant'" /><Op t="," />
          </L>
          <L n={40}>
            <I2 /><Va t="instructions" /><Op t=": " /><Va t="INSTRUCTIONS" /><Op t="," />
          </L>
          <L n={41}>
            <I2 /><Va t="model" /><Op t=": " /><Kw t="new " /><Fn t="OpenAIChatCompletionsModel" /><Op t="(" /><Va t="llmClient" /><Op t=", " /><Va t="modelName" /><Op t=")," />
          </L>
          <L n={42}>
            <I2 /><Va t="tools" /><Op t="," />
          </L>
          <L n={43}>
            <I /><Op t="});" />
          </L>
          <L n={44} />

          {/* ── Step 5: Run Agent ── */}
          <L n={45}>
            <I /><Cmt t="// 5. Launch Agent with Store Session injected" />
          </L>
          <L n={46}>
            <I /><Kw t="const " /><Va t="result" /><Op t=" = " /><Kw t="await " /><Fn t="run" /><Op t="(" />
            <Va t="agent" /><Op t=", " /><Va t="message" /><Op t=", {" />
          </L>
          <L n={47}>
            <I2 /><Va t="session" /><Op t="," />
          </L>
          <L n={48}>
            <I2 /><Va t="stream" /><Op t=": " /><Va t="true" /><Op t="," />
          </L>
          <L n={49}>
            <I2 /><Va t="signal" /><Op t=": " /><Va t="context" /><Op t="." /><Va t="request" /><Op t="." /><Va t="signal" /><Op t="," />
          </L>
          <L n={50}>
            <I /><Op t="});" />
          </L>
          <L n={51} />

          {/* ── Collect assistant text ── */}
          <L n={52}>
            <I /><Cmt t="// SSE / text_delta / tool_called streaming details omitted" />
          </L>
          <L n={53}>
            <I /><Kw t="const " /><Va t="assistantText" /><Op t=" = " /><Kw t="await " />
            <Fn t="collectAssistantText" /><Op t="(" /><Va t="result" /><Op t=");" />
          </L>
          <L n={54} />

          {/* ── Step 6: Store assistant message ── */}
          <L n={55}>
            <I /><Cmt t="// 6. EdgeOne Store: save assistant reply for /history restore" />
          </L>
          <L n={56}>
            <I /><Kw t="await " /><Va t="store" /><Op t="?." /><Fn t="appendMessage" /><Op t="?.({" />
          </L>
          <L n={57}>
            <I2 /><Va t="conversationId" /><Op t="," />
          </L>
          <L n={58}>
            <I2 /><Va t="role" /><Op t=": " /><Str t="'assistant'" /><Op t="," />
          </L>
          <L n={59}>
            <I2 /><Va t="content" /><Op t=": " /><Va t="assistantText" /><Op t="," />
          </L>
          <L n={60}>
            <I /><Op t="});" />
          </L>
          <L n={61} />
          <L n={62}>
            <I /><Kw t="return " /><Ty t="Response" /><Op t="." /><Fn t="json" />
            <Op t="({ " /><Va t="answer" /><Op t=": " /><Va t="assistantText" /><Op t=" });" />
          </L>
          <L n={63}><Op t="}" /></L>
        </div>
      </div>

      {/* ── Footer tag ── */}
      <div className={styles.footer}>
        <span className={styles.footerDot} />
        <span>OpenAI Agents SDK · EdgeOne Functions</span>
      </div>
    </div>
  );
}
