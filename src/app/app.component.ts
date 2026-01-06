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

  // 注入 Service
  constructor(
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    console.log('正在嘗試讀取資料...');
    await this.refreshLogs();
  }

  async save(food: string, amount: number, amountInput: HTMLInputElement) {
    if (!food || amount <= 0) {
      this.snackBar.open('請輸入正確的份量 🥣', '知道了', { duration: 2000 });
      return;
    }

    await this.supabaseService.addFeedingLog(food, amount);
    await this.refreshLogs();

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
      const { data } = await this.supabaseService.getTodayLogs();
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
}
