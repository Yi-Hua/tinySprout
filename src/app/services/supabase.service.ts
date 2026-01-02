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
  async addFeedingLog(foodName: string, amount: number) {
    return await this.supabase
      .from('feeding_logs')
      .insert([
        { food_name: foodName, amount: amount }
      ]);
  }

  // 3. 獲取今天的紀錄
  async getTodayLogs() {
    const today = new Date().toISOString().split('T')[0];
    return await this.supabase
      .from('feeding_logs')
      .select('*')
      .gte('created_at', today)
      .order('created_at', { ascending: false });
  }
}
