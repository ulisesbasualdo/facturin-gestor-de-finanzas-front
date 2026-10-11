import { Component } from '@angular/core';
import { ItemList } from './items/item-list';
import { TopBar } from './layout/top-bar';
import { MonthNav } from './month/month-nav';
import { MonthTitle } from './month/month-title';
import { SummaryCard } from './summary/summary-card';

@Component({
  selector: 'app-root',
  imports: [TopBar, MonthNav, MonthTitle, SummaryCard, ItemList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
