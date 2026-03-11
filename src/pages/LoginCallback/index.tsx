import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeComeCode } from '../../services/auth';
import { Loading } from '../../components/common/Loading';
import { ErrorView } from '../../components/common/ErrorView';
import { getErrorMessage } from '../../utils/error';
import type { LoginRouteState } from '../../types/api';

/**
 * 登录回调页
 * 从 URL 取 code（或 mock），调用 exchangeComeCode 换 token 并写 store，成功后跳转 from 或 /home
 */
export function LoginCallback() {
  const [error, setError] = useState<string | null>(null);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const code: string = search.get('code') ?? 'mock-code';

  useEffect(() => {
    exchangeComeCode(code)
      .then(() => {
        const from: string = (location.state as LoginRouteState | null)?.from ?? '/home';
        navigate(from, { replace: true });
      })
      .catch((err: unknown) => setError(getErrorMessage(err, '认证服务异常，请稍后重试')));
  }, [code, navigate, location.state]);

  if (error) return <ErrorView message={error} onRetry={() => window.location.reload()} />;
  return <Loading text="登录中，正在同步身份" />;
}
