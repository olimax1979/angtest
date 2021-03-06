import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut, visibility } from '../animations/app.animation';
import { expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    
    },
    animations: [
      flyInOut(),
      expand(),
      visibility(),
    ]
})

export class ContactComponent implements OnInit {
  
    feedbackForm: FormGroup;
    feedback: Feedback;
    contactType = ContactType;
    feedbackSubmitted=null;
    isSubmitted:boolean;
    initFeedback:boolean;
    spinnerHidden=true;
    visibility='shown';
    formErrors = {
      'firstname': '',
      'lastname': '',
      'telnum': '',
      'email': ''
    };
  
    validationMessages = {
      'firstname': {
        'required':      'First Name is required.',
        'minlength':     'First Name must be at least 2 characters long.',
        'maxlength':     'FirstName cannot be more than 25 characters long.'
      },
      'lastname': {
        'required':      'Last Name is required.',
        'minlength':     'Last Name must be at least 2 characters long.',
        'maxlength':     'Last Name cannot be more than 40 characters long.'
      },
      'telnum': {
        'required':      'Tel. number is required.',
        'pattern':       'Tel. number must contain only numbers.'
      },
      'email': {
        'required':      'Email is required.',
        'email':         'Email not in valid format.'
      },
    };
  
    constructor(
      private feedbackService: FeedbackService,
      @Inject('BaseURL') private BaseURL,
      private fb: FormBuilder) {
      this.createForm();
    }
  
    ngOnInit() {
    }
  
    createForm() {
      this.feedbackForm = this.fb.group({
        firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
        lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)] ],
        telnum: ['', [Validators.required, Validators.pattern] ],
        email: ['', [Validators.required, Validators.email] ],
        agree: false,
        contacttype: 'None',
        message: ''
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
      this.feedback = this.feedbackForm.value;
      this.initFeedback=true;
      this.isSubmitted=false;
      this.spinnerHidden=false;
      setTimeout(() => {
      this.feedbackService.submitFeedback(this.feedback)
      .subscribe(feedback => this.feedbackSubmitted = feedback);
      console.log(this.feedbackSubmitted, this.isSubmitted=true, this.spinnerHidden=true, )
    }, 5000);
    
      this.feedbackForm.reset({
        firstname: '',
        lastname: '',
        telnum: '',
        email: '',
        agree: false,
        contacttype: 'None',
        message: ''
      });
      setTimeout(() => {
      this.initFeedback=false;
      this.isSubmitted=false;
    }, 15000);
      
    
    
    }
    
  }
