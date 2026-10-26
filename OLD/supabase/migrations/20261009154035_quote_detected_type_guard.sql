-- Defense-in-depth: a validated format must agree with the reserved extension.
alter table public.quote_attachments
  add constraint quote_detected_type_matches_extension check (
    detected_type is null or
    (extension='.stl' and detected_type in ('stl-binary','stl-ascii')) or
    (extension='.3mf' and detected_type='3mf-zip') or
    (extension='.obj' and detected_type='obj-text') or
    (extension in ('.step','.stp') and detected_type='step-text') or
    (extension='.pdf' and detected_type='pdf') or
    (extension='.png' and detected_type='png') or
    (extension in ('.jpg','.jpeg') and detected_type='jpeg') or
    (extension='.webp' and detected_type='webp')
  );
