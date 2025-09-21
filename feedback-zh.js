// 中文反馈页面交互功能
document.addEventListener('DOMContentLoaded', function() {
  // 获取表单元素
  const feedbackCategory = document.getElementById('feedback-category');
  const optionalFields = document.getElementById('optional-fields');
  const toggleOptionalBtn = document.getElementById('toggle-optional');
  const priorityGroup = document.getElementById('priority-group');
  const deviceInfoGroup = document.getElementById('device-info-group');
  const stepsGroup = document.getElementById('steps-group');
  
  // 根据反馈类型显示/隐藏相关字段
  function updateOptionalFields() {
    const type = feedbackCategory.value;
    const showForBug = type === 'bug';
    
    priorityGroup.style.display = showForBug ? 'block' : 'none';
    deviceInfoGroup.style.display = showForBug ? 'block' : 'none';
    stepsGroup.style.display = showForBug ? 'block' : 'none';
  }
  
  // 监听反馈类型变化
  feedbackCategory.addEventListener('change', updateOptionalFields);
  
  // 切换可选字段显示/隐藏
  toggleOptionalBtn?.addEventListener('click', () => {
    const isVisible = optionalFields.style.display !== 'none';
    optionalFields.style.display = isVisible ? 'none' : 'block';
    toggleOptionalBtn.textContent = isVisible ? '更多选项' : '隐藏选项';
    toggleOptionalBtn.classList.toggle('active', !isVisible);
    
    if (!isVisible) {
      updateOptionalFields();
    }
  });
  
  // 本地存储功能
  const STORAGE_KEY = 'oro_feedback_history_zh';
  const DRAFT_KEY = 'oro_feedback_draft_zh';
  
  function saveFeedbackHistory(feedback) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newFeedback = {
      ...feedback,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };
    history.unshift(newFeedback);
    // 保持最近 20 条记录
    if (history.length > 20) {
      history.splice(20);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    displayFeedbackHistory();
  }
  
  function saveDraft() {
    const formData = new FormData(document.getElementById('feedback-form'));
    const draft = {
      title: formData.get('title'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      deviceInfo: formData.get('deviceInfo'),
      steps: formData.get('steps'),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    
    // 显示保存成功提示
    const saveDraftBtn = document.getElementById('save-draft');
    const originalText = saveDraftBtn.textContent;
    saveDraftBtn.textContent = '✓ 已保存';
    saveDraftBtn.classList.add('success');
    
    setTimeout(() => {
      saveDraftBtn.textContent = originalText;
      saveDraftBtn.classList.remove('success');
    }, 2000);
  }
  
  function loadDraft() {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (draft) {
      document.getElementById('feedback-title').value = draft.title || '';
      document.getElementById('feedback-category').value = draft.category || '';
      document.getElementById('feedback-priority').value = draft.priority || 'medium';
      document.getElementById('feedback-description').value = draft.description || '';
      document.getElementById('device-info').value = draft.deviceInfo || '';
      document.getElementById('reproduction-steps').value = draft.steps || '';
    }
  }
  
  function displayFeedbackHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p>暂无反馈记录</p>
        </div>
      `;
      return;
    }
    
    historyList.innerHTML = history.map(item => `
      <div class="history-item card">
        <div class="history-header">
          <div class="history-type">
            ${item.category === 'bug' ? '🐛' : item.category === 'feature' ? '✨' : '💬'}
            <span class="history-title">${item.title}</span>
          </div>
          <div class="history-meta">
            <span class="history-date">${new Date(item.timestamp).toLocaleDateString('zh-CN')}</span>
            ${item.priority ? `<span class="priority-badge priority-${item.priority}">${item.priority}</span>` : ''}
          </div>
        </div>
        <div class="history-content">
          <p>${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
        </div>
        <div class="history-actions">
          <button class="btn-ghost small" onclick="resubmitFeedback(${item.id})">重新提交</button>
          <button class="btn-ghost small danger" onclick="deleteFeedback(${item.id})">删除</button>
        </div>
      </div>
    `).join('');
  }
  
  // 反馈类型映射
  const feedbackTypes = {
    bug: '问题反馈',
    feature: '功能建议',
    general: '一般反馈'
  };
  
  // 全局函数
  window.resubmitFeedback = function(id) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const feedback = history.find(item => item.id === id);
    if (feedback) {
      const subject = `[Oro 反馈] ${feedback.title}`;
      let body = `类型: ${feedbackTypes[feedback.category] || feedback.category}\n\n`;
      body += `描述: ${feedback.description}\n\n`;
      if (feedback.priority) body += `优先级: ${feedback.priority}\n\n`;
      if (feedback.deviceInfo) body += `设备信息: ${feedback.deviceInfo}\n\n`;
      if (feedback.steps) body += `重现步骤: ${feedback.steps}\n\n`;
      body += `提交时间: ${new Date(feedback.timestamp).toLocaleString('zh-CN')}`;
      
      const mailto = `mailto:he0564@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailto);
    }
  };
  
  window.deleteFeedback = function(id) {
    if (confirm('确定要删除这条反馈记录吗？')) {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      displayFeedbackHistory();
    }
  };
  
  // 事件监听
  document.getElementById('save-draft')?.addEventListener('click', saveDraft);
  
  document.getElementById('clear-history')?.addEventListener('click', () => {
    if (confirm('确定要清空所有反馈记录吗？此操作不可恢复。')) {
      localStorage.removeItem(STORAGE_KEY);
      displayFeedbackHistory();
    }
  });
  
  // 表单提交
  const form = document.getElementById('feedback-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const feedbackData = {
      title: formData.get('title'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      deviceInfo: formData.get('deviceInfo'),
      steps: formData.get('steps')
    };
    
    // 保存到历史
    saveFeedbackHistory(feedbackData);
    
    // 生成邮件
    const subject = `[Oro 反馈] ${feedbackData.title}`;
    let body = `类型: ${feedbackTypes[feedbackData.category] || feedbackData.category}\n\n`;
    body += `描述: ${feedbackData.description}\n\n`;
    if (feedbackData.priority) body += `优先级: ${feedbackData.priority}\n\n`;
    if (feedbackData.deviceInfo) body += `设备信息: ${feedbackData.deviceInfo}\n\n`;
    if (feedbackData.steps) body += `重现步骤: ${feedbackData.steps}\n\n`;
    body += `提交时间: ${new Date().toLocaleString('zh-CN')}`;
    
    const mailto = `mailto:he0564@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    
    // 显示提交成功提示
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✓ 已提交';
    submitBtn.classList.add('success');
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('success');
      // 重置表单
      form.reset();
      optionalFields.style.display = 'none';
      toggleOptionalBtn.textContent = '更多选项';
      toggleOptionalBtn.classList.remove('active');
    }, 2000);
    
    // 清除草稿
    localStorage.removeItem(DRAFT_KEY);
  });
  
  // 页面加载时初始化
  loadDraft();
  displayFeedbackHistory();
});
