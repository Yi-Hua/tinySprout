// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './services/supabase.service'; // 確保路徑對
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  logs: any[] = [];
  isSaving = false; // 新增狀態
  currentTime: string = '';
  currentDate: string = ''; // ✨ 新增：日期變數 (格式 YYYY-MM-DD)
  // 注入 Service
  constructor(
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    console.log('正在嘗試讀取資料...');
    this.setDefaultTime(); // 初始化時間與日期
    await this.refreshLogs(); // 讀取資料
  }

  // 設定預設時間的小函式
  setDefaultTime() {
    const now = new Date();

    // 設定時間 HH:mm
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;

    // ✨ 設定日期 YYYY-MM-DD
    // 注意：toISOString 會轉成 UTC，台灣是 +8，所以直接用 Local 時間組字串比較保險
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.currentDate = `${year}-${month}-${day}`;
  }

  // ✨ 當使用者改變日期時，重新讀取那天資料
  async onDateChange() {
    await this.refreshLogs();
  }

  async save(food: string, amount: number, amountInput: HTMLInputElement) {
    if (!food || amount <= 0 || this.isSaving) {
      this.snackBar.open('請輸入正確的份量 🥣', '知道了', { duration: 2000 });
      return;
    }

    this.isSaving = true; // 開始儲存

    // 組合日期與選定的時間
    // 我們利用 Date 建構式：new Date(year, monthIndex, day, hours, minutes)
    let finalTimestamp = new Date(); // 預設現在

    if (this.currentDate && this.currentTime) {
      const [year, month, day] = this.currentDate.split('-').map(Number);
      const [hours, minutes] = this.currentTime.split(':').map(Number);

      // 注意 month 參數是 0-11，所以要減 1
      finalTimestamp = new Date(year, month - 1, day, hours, minutes, 0);
    }
    await this.supabaseService.addFeedingLog(food, amount, finalTimestamp.toISOString());
    await this.refreshLogs();
    this.isSaving = false; // 儲存完成

    // 2. 成功後顯示提示
    this.snackBar.open('紀錄成功！✨', '', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });

    // 3. 清空輸入框
    amountInput.value = '15'; // 或是清空為 ''
  }

 async refreshLogs() {
    try {
      // ✨ 傳入目前選定的日期
      const { data } = await this.supabaseService.getLogsByDate(this.currentDate);
      this.logs = data || [];
      console.log('資料讀取成功:', this.logs);
    } catch (e) {
      console.error('讀取失敗:', e);
    }
  }

  async deleteLog(id: number) {
    if (confirm('確定要刪除？')) {
      await this.supabaseService.deleteLog(id);
      await this.refreshLogs();
    }
  }

  // 計算今日總克數
  get totalAmount(): number {
    return this.logs.reduce((sum, log) => sum + (log.amount || 0), 0);
  }

  // 計算距離上次餵食的時間描述
  get timeSinceLastFeeding(): string {
    if (this.logs.length === 0) return '尚未紀錄';

    // 取得最新的一筆紀錄時間
    const lastTime = new Date(this.logs[0].created_at).getTime();
    const now = new Date().getTime();
    const diffInMinutes = Math.floor((now - lastTime) / (1000 * 60));

    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;

    const hours = Math.floor(diffInMinutes / 60);
    const mins = diffInMinutes % 60;
    return mins > 0 ? `${hours} 小時 ${mins} 分鐘前` : `${hours} 小時前`;
  }

  // 用來判斷「目前選的日期」是不是「今天」
  get isTodaySelected(): boolean {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    return this.currentDate === todayStr;
  }

  // 根據判斷結果回傳標題文字
  get dateTitle(): string {
    return this.isTodaySelected ? '今日足跡 🐾' : `${this.currentDate} 足跡 📅`;
  }
}
