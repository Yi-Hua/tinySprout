// supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {

    // 初始化 Supabase 客戶端
    console.log('this.env', Object.keys(environment).length === 0)
    const env = environment as any;
    this.supabase = createClient(env.supabaseUrl, env.supabaseKey);


    // 這裡做個保險：如果環境變數沒抓到，直接印出來看
    console.log('連線網址:', env.supabaseUrl);

    if (!env.supabaseUrl || !env.supabaseKey) {
      console.error('錯誤：Supabase 金鑰遺失，請檢查 environment.ts');
    }

    this.supabase = createClient(
      env.supabaseUrl,
      env.supabaseKey
    );
  }

  // 1. 取得所有食材 (地瓜、蓮藕等)
  async getFoods() {
    return await this.supabase
      .from('foods')
      .select('*')
      .order('name', { ascending: true });
  }

  // 2. 儲存紀錄
  async addFeedingLog(food_name: string, amount: number, customTime?: string) {
    const payload: any = { food_name, amount };
    if (customTime) {
      payload.created_at = customTime; // 覆蓋自動產生的時間
    }
    return await this.supabase.from('feeding_logs').insert([payload]);
  }

  // 3. get Logs By Date, dateStr 格式預期為 'YYYY-MM-DD'
  async getLogsByDate(dateStr: string) {
    // 這一天的 00:00:00
    const start = `${dateStr}T00:00:00`;
    // 這一天的 23:59:59 (簡單做法是找隔天的 00:00:00 之前，或直接用當天範圍)
    // 這裡示範用 gte (大於等於) 當天 00:00 且 lt (小於) 隔天 00:00 會最準確

    // 為了簡單實作，我們先用既有的 gte 邏輯，
    // 但 Supabase 若只比對日期字串，我們可以用這招：

    // 取得隔天的日期字串，用來做範圍搜尋
    const nextDayDate = new Date(dateStr);
    nextDayDate.setDate(nextDayDate.getDate() + 1);
    const nextDayStr = nextDayDate.toISOString().split('T')[0];

    return await this.supabase
      .from('feeding_logs')
      .select('*')
      .gte('created_at', dateStr)      // 大於等於選定日期
      .lt('created_at', nextDayStr)    // 小於隔天日期
      .order('created_at', { ascending: false });
  }

  async deleteLog(id: number) {
    return await this.supabase.from('feeding_logs').delete().eq('id', id);
  }
}
