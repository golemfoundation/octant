import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

type UseIsAddToAllocateButtonVisibleProps = { isAllocatedTo: boolean; isArchivedProject: boolean };

export default function useIsAddToAllocateButtonVisible({
  isAllocatedTo,
  isArchivedProject,
}: UseIsAddToAllocateButtonVisibleProps): boolean {
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  return (
    !isProjectAdminMode &&
    !isPatronMode &&
    ((isAllocatedTo && isArchivedProject) || !isArchivedProject)
  );
}
