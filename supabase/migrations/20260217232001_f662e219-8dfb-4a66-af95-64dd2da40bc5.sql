-- Manejo needs to read user_roles to find vendors
CREATE POLICY "Manejo can view user roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'manejo'::app_role));

-- Manejo needs to read profiles to get vendor names
CREATE POLICY "Manejo can view profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'manejo'::app_role));

-- Manejo needs to create and manage leads
CREATE POLICY "Manejo can manage leads"
ON public.leads
FOR ALL
USING (has_role(auth.uid(), 'manejo'::app_role))
WITH CHECK (has_role(auth.uid(), 'manejo'::app_role));

-- Manejo needs to create notifications for vendors
CREATE POLICY "Manejo can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'manejo'::app_role));