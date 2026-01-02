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
  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    console.log('正在嘗試讀取資料...');
    await this.refreshLogs();
  }

  async save(food: string, amount: number) {
    if (!food || amount <= 0) return;
    await this.supabaseService.addFeedingLog(food, amount);
    await this.refreshLogs();
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
}
