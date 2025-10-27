import { List, MemberRole, ListMember } from '@/types';

export class MemberService {
  static createMembership(
    userId: string,
    listId: string,
    role: MemberRole
  ): ListMember {
    return {
      userId,
      listId,
      role,
      joinedAt: new Date().toISOString(),
    };
  }

  static changeRole(membership: ListMember, newRole: MemberRole): ListMember {
    console.log(
      `[MemberService] Changing role for user ${membership.userId} to ${newRole}`
    );
    return {
      ...membership,
      role: newRole,
    };
  }

  static canManageCategories(
    membership: ListMember,
    list: List
  ): boolean {
    if (membership.role === 'Owner') return true;
    return list.allowMemberCategoryManage;
  }

  static canArchiveList(membership: ListMember): boolean {
    return membership.role === 'Owner';
  }

  static canChangeRoles(membership: ListMember): boolean {
    return membership.role === 'Owner';
  }

  static canRemoveMember(
    actorMembership: ListMember,
    targetMembership: ListMember
  ): boolean {
    if (actorMembership.role !== 'Owner') return false;
    if (targetMembership.role === 'Owner') return false;
    return true;
  }

  static getMemberRole(
    userId: string,
    memberships: ListMember[],
    listId: string
  ): MemberRole | null {
    const membership = memberships.find(
      (m) => m.userId === userId && m.listId === listId
    );
    return membership?.role || null;
  }
}
