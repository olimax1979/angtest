import { Component, OnInit } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Feedback } from '../shared/feedback';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;
  feedbackForm: FormGroup;
  feedback: Feedback;
  d=new Date();
  formErrors = {
    'author': '',
    'comment': '',
  }
  
  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 40 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
    },
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {this.createForm(); }

    ngOnInit() {
      
          this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
          this.route.params
            .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
            .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
        }
      
        setPrevNext(dishId: number) {
          let index = this.dishIds.indexOf(dishId);
          this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
          this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
        }

        createForm() {
          this.feedbackForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
            rating: 5,
            comment: ['', [Validators.required] ],
            date: this.d.toISOString(),
          });
    
          this.feedbackForm.valueChanges
          .subscribe(data => this.onValueChanged(data));
    
          this.onValueChanged(); // (re)set validation messages now
    
        }
      
        onValueChanged(data?: any) {
          if (!this.feedbackForm) { return; }
          const form = this.feedbackForm;
          for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
              const messages = this.validationMessages[field];
              for (const key in control.errors) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
    
        onSubmit() {
          this.dish.comments.push(this.feedbackForm.value);
          this.feedbackForm.reset({
            author: '',
            rating: '5',
            comment: '',
            date: '',
            
          },
          
        )
        }

  goBack(): void {
    this.location.back();
  }

}
