import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** 游戏列表页路径；返回游戏时统一用 replace 入栈，避免左上角返回时回到结算/通关/准备页 */
export const LEVELS_PATH = '/levels';

/**
 * 返回游戏列表（replace 方式），用于结算页、通关页、准备页等「返回游戏/回到列表」按钮。
 * 保证从游戏流程离开后，再点浏览器/左上角返回不会回到已离开的页面。
 */
export function useBackToLevels(): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    navigate(LEVELS_PATH, { replace: true });
  }, [navigate]);
}
