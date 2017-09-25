import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Feedback } from '../shared/feedback';
import { visibility } from '../animations/app.animation';
import { flyInOut } from '../animations/app.animation';
import { expand } from '../animations/app.animation';

import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    },
  animations: [
    visibility(),
    flyInOut(),
    expand(),
  ]
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishcopy=null;
  dishIds: number[];
  prev: number;
  next: number;
  feedbackForm: FormGroup;
  feedback: Feedback;
  visibility = 'shown';
  formErrors = {
    'author': '',
    'comment': '',
  }
  errMess: string;
  
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
    @Inject('BaseURL') private BaseURL,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {this.createForm();
       }

    ngOnInit() {
      
          this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
          this.route.params
          .switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); })
          .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
              errmess => { this.dish = null; this.errMess = <any>errmess; });
        }
      
        setPrevNext(dishId: number) {
          let index = this.dishIds.indexOf(dishId);
          this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
          this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
        }

        createForm() {
          this.feedbackForm = this.fb.group({
            author: ['', Validators.required, Validators.minLength(2), Validators.maxLength(25)] ,
            rating: 5,
            comment: ['', Validators.required] ,
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
          this.feedbackForm.value.date=new Date().toISOString();
          console.log(this.feedbackForm.value);
          this.dishcopy.comments.push(this.feedbackForm.value);
          this.dishcopy.save()
            .subscribe(dish => { this.dish = dish; console.log(this.dish); });
          
          this.feedbackForm.reset({
            author: '',
            rating: '5',
            comment: '',
            date: '',
            
          },
          
        )
        }

        onReset() {
          this.dishcopy.comments.pop();
          this.dishcopy.save()
          .subscribe(dish => { this.dish = dish; console.log(this.dish); });
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
