import json
from pathlib import Path
"""Immutable assessment drafts. Activation and response collection live in assessments.py."""
from datetime import datetime,timezone
from uuid import uuid4
from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel,ConfigDict,Field,model_validator
from typing import Literal

CATALOG=[
 {'key':'receiver_l1_el','title':'Αξιολόγηση δέκτη L1','source':'F01','open_decisions':['OD-07: Option 6 και τύποι απαντήσεων']},
 {'key':'receiver_l2_el','title':'Αξιολόγηση δέκτη L2','source':'F02','open_decisions':['OD-07: λείπουν επιλογές ερώτησης άνεσης']},
 {'key':'practitioner_l2_el','title':'Αναστοχασμός practitioner L2','source':'F03','open_decisions':['OD-03: κύκλος συνεδριών','OD-07: υποχρεωτικότητα σημειώσεων']},
 {'key':'practitioner_group_el','title':'Αναστοχασμός ομαδικής συνεδρίας','source':'F04','open_decisions':['OD-06: αντιστοίχιση Level / έκδοσης']},
 {'key':'practitioner_l1_el','title':'Αναστοχασμός practitioner L1','source':'D05','open_decisions':['Πλήρες κείμενο φόρμας δεν έχει επαληθευτεί']},
 {'key':'participant_group_el','title':'Αξιολόγηση συμμετέχοντα ομάδας','source':'D14','open_decisions':['Πλήρες κείμενο φόρμας δεν έχει επαληθευτεί']},
]
class Question(BaseModel):
 model_config=ConfigDict(extra='forbid',str_strip_whitespace=True)
 key:str=Field(pattern=r'^[a-z][a-z0-9_]{0,63}$')
 label:str=Field(min_length=2,max_length=3000)
 applies_to:Literal['all','first','repeat']='all'
 kind:Literal['unknown','text','single','multi','scale']='unknown'
 required:bool|None=None
 options:list[str]=Field(default_factory=list,max_length=50)
 @model_validator(mode='after')
 def valid_options(self):
  if any(not x.strip() or len(x)>500 for x in self.options) or len(set(self.options))!=len(self.options):raise ValueError('Options must be distinct, nonempty and at most 500 characters')
  if self.kind in ('single','multi','scale') and len(self.options)<2:raise ValueError('Selection questions need verified options')
  if self.kind=='text' and self.options:raise ValueError('Text questions cannot have options')
  return self
class FormDraft(BaseModel):
 model_config=ConfigDict(extra='forbid',str_strip_whitespace=True)
 template_key:str
 source_note:str=Field(min_length=3,max_length=3000)
 questions:list[Question]=Field(min_length=1,max_length=100)
 @model_validator(mode='after')
 def unique_keys(self):
  if len({q.key for q in self.questions})!=len(self.questions):raise ValueError('Question keys must be unique')
  return self

def build_form_router(db,admin_user):
 router=APIRouter(prefix='/api/admin/forms')
 @router.get('')
 async def list_forms(admin=Depends(admin_user)):
  versions=await db.form_drafts.find({}, {'_id':0}).sort('created_at',-1).to_list(500)
  return {'catalog':CATALOG,'versions':versions,'publication_enabled':True,'activation_required':True,'active_assignments':await db.assessment_configuration.find({}, {'_id':1,'form_id':1}).to_list(32),'source_templates':json.loads(Path(__file__).with_name('assessment_sources.json').read_text(encoding='utf-8'))}
 @router.post('')
 async def save_version(payload:FormDraft,admin=Depends(admin_user)):
  source=next((c for c in CATALOG if c['key']==payload.template_key),None)
  if not source:raise HTTPException(422,'Unknown source template')
  doc={'id':str(uuid4()),**payload.model_dump(),'source':source['source'],'open_decisions':source['open_decisions'],'status':'draft','created_by':admin['id'],'created_at':datetime.now(timezone.utc)}
  await db.form_drafts.insert_one(dict(doc))
  return doc
 return router
