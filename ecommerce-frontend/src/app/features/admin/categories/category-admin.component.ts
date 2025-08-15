import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Category } from '../../../core/services/api.service';

@Component({
	selector: 'app-category-admin',
	standalone: true,
	imports: [CommonModule, FormsModule],
	template: `
		<div class="wrap">
			<h2>Categories</h2>
			<form class="form" (ngSubmit)="save()">
				<input placeholder="Id" [(ngModel)]="form.id" name="id" required />
				<input placeholder="Name" [(ngModel)]="form.name" name="name" required />
				<input placeholder="Description" [(ngModel)]="form.description" name="description" required />
				<button type="submit">{{ editing ? 'Update' : 'Create' }}</button>
				<button type="button" (click)="reset()" *ngIf="editing">Cancel</button>
			</form>
			<div class="list">
				<div class="row" *ngFor="let c of categories()">
					<div>{{ c.id }}</div>
					<div>{{ c.name }}</div>
					<div>{{ c.description }}</div>
					<div>
						<button (click)="edit(c)">Edit</button>
						<button (click)="remove(c)">Delete</button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.wrap { padding: 16px; display: grid; gap: 12px; }
		.form { display: grid; grid-template-columns: 1fr 1fr 2fr auto auto; gap: 8px; align-items: center; }
		.list { display: grid; gap: 6px; }
		.row { display: grid; grid-template-columns: 1fr 1fr 2fr auto; gap: 8px; background: white; padding: 8px; border-radius: 6px; align-items: center; }
	`]
})
export class CategoryAdminComponent implements OnInit {
	categories = signal<Category[]>([]);
	form: any = { id: '', name: '', description: '' };
	editing = false;

	constructor(private api: ApiService) {}

	ngOnInit() {
		this.load();
	}

	load() {
		this.api.getCategoriesPaged({ page: 0, size: 100 }).subscribe(res => this.categories.set(res.content));
	}

	save() {
		if (this.editing) {
			this.api.updateCategory(this.form.id, { name: this.form.name, description: this.form.description }).subscribe(() => { this.reset(); this.load(); });
		} else {
			this.api.createCategory({ id: this.form.id, name: this.form.name, description: this.form.description }).subscribe(() => { this.reset(); this.load(); });
		}
	}

	edit(c: Category) {
		this.form = { id: c.id, name: c.name, description: c.description };
		this.editing = true;
	}

	remove(c: Category) {
		if (!confirm('Delete category?')) return;
		this.api.deleteCategory(c.id).subscribe(() => this.load());
	}

	reset() {
		this.form = { id: '', name: '', description: '' };
		this.editing = false;
	}
}