import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
<<<<<<< Updated upstream
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
=======
  imports: [RouterOutlet],
  template: '<router-outlet />',
>>>>>>> Stashed changes
})
export class App {}
