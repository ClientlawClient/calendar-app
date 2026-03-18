// 日历应用核心逻辑
class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.events = this.loadEvents();
        
        this.initElements();
        this.bindEvents();
        this.renderCalendar();
        this.updateEventList();
        this.updateCurrentDate();
    }
    
    // 初始化DOM元素引用
    initElements() {
        this.elements = {
            calendarGrid: document.getElementById('calendar-grid'),
            monthYearDisplay: document.getElementById('month-year'),
            currentYearMonth: document.getElementById('current-year-month'),
            prevMonthBtn: document.getElementById('prev-month'),
            nextMonthBtn: document.getElementById('next-month'),
            todayBtn: document.getElementById('today-btn'),
            eventsList: document.getElementById('events-list'),
            eventCount: document.getElementById('event-count'),
            eventTitle: document.getElementById('event-title'),
            eventDate: document.getElementById('event-date'),
            eventColor: document.getElementById('event-color'),
            addEventBtn: document.getElementById('add-event-btn'),
            clearEventsBtn: document.getElementById('clear-events'),
            exportEventsBtn: document.getElementById('export-events'),
            importEventsBtn: document.getElementById('import-events'),
            eventModal: document.getElementById('event-modal'),
            closeModalBtn: document.querySelector('.close-modal'),
            closeModalBtn2: document.getElementById('close-modal-btn'),
            deleteEventBtn: document.getElementById('delete-event'),
            modalEventTitle: document.getElementById('modal-event-title'),
            modalEventDate: document.getElementById('modal-event-date'),
            modalEventColor: document.getElementById('modal-event-color')
        };
    }
    
    // 绑定事件监听器
    bindEvents() {
        this.elements.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.elements.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        this.elements.todayBtn.addEventListener('click', () => this.goToToday());
        this.elements.addEventBtn.addEventListener('click', () => this.addEvent());
        this.elements.clearEventsBtn.addEventListener('click', () => this.clearAllEvents());
        this.elements.exportEventsBtn.addEventListener('click', () => this.exportEvents());
        this.elements.importEventsBtn.addEventListener('click', () => this.importEvents());
        this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.elements.closeModalBtn2.addEventListener('click', () => this.closeModal());
        this.elements.deleteEventBtn.addEventListener('click', () => this.deleteSelectedEvent());
        
        // 按Enter键添加事件
        this.elements.eventTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addEvent();
        });
        
        // 点击模态框外部关闭
        this.elements.eventModal.addEventListener('click', (e) => {
            if (e.target === this.elements.eventModal) this.closeModal();
        });
        
        // 设置默认事件日期为今天
        const today = new Date().toISOString().split('T')[0];
        this.elements.eventDate.value = today;
        this.elements.eventDate.min = '2000-01-01';
        this.elements.eventDate.max = '2100-12-31';
    }
    
    // 渲染日历
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份年份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        this.elements.monthYearDisplay.textContent = `${year}年 ${monthNames[month]}`;
        
        // 清空日历网格
        this.elements.calendarGrid.innerHTML = '';
        
        // 获取月份的第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay(); // 0 = 周日, 1 = 周一, ...
        
        // 添加上个月的日期
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(year, month - 1, day);
            this.addCalendarDay(date, true);
        }
        
        // 添加本月的日期
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            this.addCalendarDay(date, false, isToday);
        }
        
        // 添加下个月的日期
        const totalCells = 42; // 6行 × 7列
        const cellsUsed = firstDayOfWeek + daysInMonth;
        const nextMonthDays = totalCells - cellsUsed;
        
        for (let day = 1; day <= nextMonthDays; day++) {
            const date = new Date(year, month + 1, day);
            this.addCalendarDay(date, true);
        }
    }
    
    // 添加日历日期单元格
    addCalendarDay(date, isOtherMonth, isToday = false) {
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const dateString = this.formatDate(date);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = dateString;
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // 检查是否是选中日期
        if (dateString === this.formatDate(this.selectedDate)) {
            dayElement.classList.add('selected');
        }
        
        // 添加日期数字
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // 添加事件指示器
        const eventsForDay = this.getEventsForDate(date);
        if (eventsForDay.length > 0) {
            const eventIndicator = document.createElement('div');
            eventIndicator.className = 'event-indicator';
            
            // 显示前3个事件的颜色点
            eventsForDay.slice(0, 3).forEach(event => {
                const dot = document.createElement('div');
                dot.className = 'event-dot';
                dot.style.backgroundColor = event.color;
                eventIndicator.appendChild(dot);
            });
            
            // 如果有更多事件，显示省略号
            if (eventsForDay.length > 3) {
                const moreDots = document.createElement('div');
                moreDots.className = 'event-dot';
                moreDots.style.backgroundColor = '#9ca3af';
                moreDots.title = `还有 ${eventsForDay.length - 3} 个事件`;
                eventIndicator.appendChild(moreDots);
            }
            
            dayElement.appendChild(eventIndicator);
        }
        
        // 点击事件
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
            this.elements.eventDate.value = dateString;
        });
        
        this.elements.calendarGrid.appendChild(dayElement);
    }
    
    // 选择日期
    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        this.updateEventList();
    }
    
    // 切换月份
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
        this.updateCurrentDate();
    }
    
    // 跳转到今天
    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.renderCalendar();
        this.updateCurrentDate();
        this.updateEventList();
        this.elements.eventDate.value = this.formatDate(new Date());
    }
    
    // 更新当前日期显示
    updateCurrentDate() {
        const now = new Date();
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        this.elements.currentYearMonth.textContent = 
            `${now.getFullYear()}年 ${monthNames[now.getMonth()]}`;
    }
    
    // 添加事件
    addEvent() {
        const title = this.elements.eventTitle.value.trim();
        const date = this.elements.eventDate.value;
        const color = this.elements.eventColor.value;
        
        if (!title) {
            alert('请输入事件标题');
            this.elements.eventTitle.focus();
            return;
        }
        
        if (!date) {
            alert('请选择事件日期');
            return;
        }
        
        const event = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            title: title,
            date: date,
            color: color,
            createdAt: new Date().toISOString()
        };
        
        this.events.push(event);
        this.saveEvents();
        this.renderCalendar();
        this.updateEventList();
        
        // 清空表单
        this.elements.eventTitle.value = '';
        this.elements.eventTitle.focus();
        
        // 显示成功消息
        this.showNotification('事件添加成功！', 'success');
    }
    
    // 更新事件列表
    updateEventList() {
        const selectedDateString = this.formatDate(this.selectedDate);
        const eventsForSelectedDate = this.getEventsForDate(this.selectedDate);
        
        this.elements.eventCount.textContent = eventsForSelectedDate.length;
        
        if (eventsForSelectedDate.length === 0) {
            this.elements.eventsList.innerHTML = `
                <div class="empty-events">
                    <i class="fas fa-calendar-plus"></i>
                    <p>${selectedDateString} 还没有安排事件</p>
                    <small>点击下方添加按钮开始计划</small>
                </div>
            `;
            return;
        }
        
        this.elements.eventsList.innerHTML = '';
        
        eventsForSelectedDate.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.dataset.eventId = event.id;
            
            const colorName = this.getColorName(event.color);
            
            eventElement.innerHTML = `
                <div class="event-item-content">
                    <h4>${this.escapeHtml(event.title)}</h4>
                    <div class="event-date">${event.date} • ${colorName}</div>
                </div>
                <div class="event-color-preview" style="background-color: ${event.color}"></div>
            `;
            
            eventElement.addEventListener('click', () => this.showEventDetails(event));
            this.elements.eventsList.appendChild(eventElement);
        });
    }
    
    // 显示事件详情
    showEventDetails(event) {
        this.selectedEvent = event;
        
        this.elements.modalEventTitle.textContent = event.title;
        this.elements.modalEventDate.textContent = event.date;
        
        const colorName = this.getColorName(event.color);
        this.elements.modalEventColor.textContent = colorName;
        this.elements.modalEventColor.style.backgroundColor = event.color;
        this.elements.modalEventColor.style.color = this.getContrastColor(event.color);
        
        this.elements.eventModal.classList.add('active');
    }
    
    // 删除选中事件
    deleteSelectedEvent() {
        if (!this.selectedEvent) return;
        
        if (confirm(`确定要删除事件 "${this.selectedEvent.title}" 吗？`)) {
            this.events = this.events.filter(e => e.id !== this.selectedEvent.id);
            this.saveEvents();
            this.renderCalendar();
            this.updateEventList();
            this.closeModal();
            this.showNotification('事件已删除', 'success');
        }
    }
    
    // 关闭模态框
    closeModal() {
        this.elements.eventModal.classList.remove('active');
        this.selectedEvent = null;
    }
    
    // 清除所有事件
    clearAllEvents() {
        if (this.events.length === 0) {
            alert('当前没有事件可清除');
            return;
        }
        
        if (confirm(`确定要清除所有 ${this.events.length} 个事件吗？此操作不可撤销。`)) {
            this.events = [];
            this.saveEvents();
            this.renderCalendar();
            this.updateEventList();
            this.showNotification('所有事件已清除', 'success');
        }
    }
    
    // 导出事件
    exportEvents() {
        if (this.events.length === 0) {
            alert('当前没有事件可导出');
            return;
        }
        
        const dataStr = JSON.stringify(this.events, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `calendar-events-${this.formatDate(new Date())}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('事件导出成功', 'success');
    }
    
    // 导入事件
    importEvents() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedEvents = JSON.parse(event.target.result);
                    
                    if (!Array.isArray(importedEvents)) {
                        throw new Error('文件格式不正确');
                    }
                    
                    // 验证事件结构
                    const validEvents = importedEvents.filter(event => 
                        event.title && event.date && event.color
                    );
                    
                    if (validEvents.length === 0) {
                        throw new Error('文件中没有有效的事件数据');
                    }
                    
                    // 合并事件（避免重复ID）
                    const existingIds = new Set(this.events.map(e => e.id));
                    const newEvents = validEvents.filter(event => !existingIds.has(event.id));
                    
                    this.events.push(...newEvents);
                    this.saveEvents();
                    this.renderCalendar();
                    this.updateEventList();
                    
                    this.showNotification(`成功导入 ${newEvents.length} 个事件`, 'success');
                    
                } catch (error) {
                    alert(`导入失败: ${error.message}`);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // 获取指定日期的事件
    getEventsForDate(date) {
        const dateString = this.formatDate(date);
        return this.events.filter(event => event.date === dateString);
    }
    
    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 根据颜色值获取颜色名称
    getColorName(color) {
        const colorMap = {
            '#3b82f6': '蓝色',
            '#10b981': '绿色', 
            '#f59e0b': '橙色',
            '#ef4444': '红色',
            '#8b5cf6': '紫色'
        };
        return colorMap[color] || '自定义颜色';
    }
    
    // 获取对比色（用于深色背景上的文字）
    getContrastColor(hexColor) {
        // 简化版本：如果颜色较深，返回白色，否则返回黑色
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 移除已有的通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 加载事件数据
    loadEvents() {
        try {
            const saved = localStorage.getItem('calendarEvents');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('加载事件数据失败:', error);
            return [];
        }
    }
    
    // 保存事件数据
    saveEvents() {
        try {
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        } catch (error) {
            console.error('保存事件数据失败:', error);
        }
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new CalendarApp();
    
    // 添加通知样式
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            font-family: inherit;
            font-weight: 500;
        }
        .notification i {
            font-size: 1.2em;
        }
    `;
    document.head.appendChild(style);
    
    console.log('日历应用已初始化！');
});