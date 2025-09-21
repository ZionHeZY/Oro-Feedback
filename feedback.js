// 简洁反馈页面交互功能
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
    toggleOptionalBtn.textContent = isVisible ? 'MORE OPTIONS' : 'HIDE OPTIONS';
    toggleOptionalBtn.classList.toggle('active', !isVisible);
    
    if (!isVisible) {
      updateOptionalFields();
    }
  });
  
  // 反馈历史存储功能
  const HISTORY_FILE = './feedback-history.json';
  const DRAFT_KEY = 'oro_feedback_draft';
  
  function saveFeedbackHistory(feedback) {
    try {
      // 从localStorage读取现有历史
      const history = JSON.parse(localStorage.getItem('oro_feedback_history') || '[]');
      
      const newFeedback = {
        ...feedback,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'submitted'
      };
      history.unshift(newFeedback);
      
      // 保持最近 50 条记录
      if (history.length > 50) {
        history.splice(50);
      }
      
      // 保存到localStorage
      localStorage.setItem('oro_feedback_history', JSON.stringify(history));
      
      // 同时保存到JSON文件（仅用于查看，浏览器无法直接写入）
      console.log('反馈已保存到历史记录:', newFeedback);
      console.log('当前历史记录总数:', history.length);
      
      // 立即更新显示
      displayFeedbackHistory();
      
    } catch (error) {
      console.error('保存反馈历史失败:', error);
    }
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
    const originalText = saveDraftBtn.querySelector('.btn-text').textContent;
    saveDraftBtn.querySelector('.btn-text').textContent = '✓ 已保存';
    saveDraftBtn.classList.add('success');
    
    setTimeout(() => {
      saveDraftBtn.querySelector('.btn-text').textContent = originalText;
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
    try {
      // 从localStorage读取历史记录
      const history = JSON.parse(localStorage.getItem('oro_feedback_history') || '[]');
      const historyList = document.getElementById('history-list');
      
      console.log('显示反馈历史，记录数量:', history.length);
      
      if (history.length === 0) {
        historyList.innerHTML = `
          <div class="empty-state">
            <p>No feedback records yet</p>
            <p class="empty-subtitle">Submit your first feedback!</p>
          </div>
        `;
        return;
      }
      
      historyList.innerHTML = history.map(item => `
        <div class="history-item card">
          <div class="history-header">
            <div class="history-type">
              ${item.category === 'bug' ? '🐛' : item.category === 'feature' ? '✨' : '💬'}
              <span class="history-title">${item.title || 'Untitled'}</span>
            </div>
            <div class="history-meta">
              <span class="history-date">${new Date(item.timestamp).toLocaleDateString()}</span>
              ${item.priority ? `<span class="priority-badge priority-${item.priority}">${item.priority}</span>` : ''}
            </div>
          </div>
          <div class="history-content">
            <p>${(item.description || '').substring(0, 100)}${(item.description || '').length > 100 ? '...' : ''}</p>
          </div>
          <div class="history-actions">
            <button class="btn-ghost small" onclick="resubmitFeedback(${item.id})">Resubmit</button>
            <button class="btn-ghost small danger" onclick="deleteFeedback(${item.id})">Delete</button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('显示反馈历史失败:', error);
    }
  }
  
  // 反馈类型映射
  const feedbackTypes = {
    bug: 'BUG REPORT',
    feature: 'FEATURE REQUEST',
    general: 'GENERAL FEEDBACK'
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
    if (confirm('Are you sure you want to delete this feedback record?')) {
      const history = JSON.parse(localStorage.getItem('oro_feedback_history') || '[]');
      const newHistory = history.filter(item => item.id !== id);
      localStorage.setItem('oro_feedback_history', JSON.stringify(newHistory));
      displayFeedbackHistory();
    }
  };
  
  // 事件监听
  document.getElementById('save-draft')?.addEventListener('click', saveDraft);
  
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
    
    console.log('提交反馈数据:', feedbackData);
    
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
