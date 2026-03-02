import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";

export const LoginBridgePage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { state, actions } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const code = useMemo(() => params.get("code") ?? "", [params]);

  const runLogin = async (comeCode: string) => {
    try {
      setLoading(true);
      setErrorText("");
      await actions.loginByCome(comeCode);
      navigate("/lobby", { replace: true });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.sessionToken && state.currentUser) {
      navigate("/lobby", { replace: true });
      return;
    }

    if (!code) {
      const timer = window.setTimeout(() => {
        setParams({ code: "come-demo-code" });
      }, 900);
      return () => window.clearTimeout(timer);
    }
    void runLogin(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, navigate, setParams, state.currentUser, state.sessionToken]);

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="brand">EHS｜安全能力闯关训练平台</p>
        <h1>COME 一键登录承接页</h1>
        <p>正在拉取身份信息（工号、部门、基地）并同步账号数据…</p>

        {loading ? <div className="loading-dot">登录中，请稍候…</div> : null}
        {errorText ? <p className="error-text">{errorText}</p> : null}

        <div className="login-actions">
          <button type="button" className="primary-btn" disabled={loading} onClick={() => void runLogin("come-demo-code")}>
            重试登录
          </button>
          <button
            type="button"
            className="ghost-btn"
            disabled={loading}
            onClick={() => {
              setErrorText("");
              setParams({ code: "fail" });
            }}
          >
            模拟 COME 异常
          </button>
        </div>
      </div>
    </div>
  );
};
