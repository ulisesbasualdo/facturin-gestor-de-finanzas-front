import { Component } from '@angular/core';
import { TopBar } from './layout/top-bar';
import { MonthNav } from './month/month-nav';
import { MonthTitle } from './month/month-title';
import { SummaryCard } from './summary/summary-card';

@Component({
  selector: 'app-root',
  imports: [TopBar, MonthNav, MonthTitle, SummaryCard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
